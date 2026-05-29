from datetime import date, timedelta

from sqlalchemy import func, extract, desc
from sqlalchemy.orm import Session

from ..models.accident import Accident
from ..models.driver import Driver


def _apply_filters(
    q,
    *,
    date_from: date | None = None,
    date_to: date | None = None,
    location: str | None = None,
    driver_id: int | None = None,
    accident_type: str | None = None,
):
    """Применяет общие фильтры статистики к SQLAlchemy-запросу по Accident."""
    if date_from:
        q = q.filter(Accident.accident_date >= date_from)
    if date_to:
        q = q.filter(Accident.accident_date <= date_to)
    if location:
        q = q.filter(Accident.location.ilike(f"%{location}%"))
    if driver_id:
        q = q.filter(Accident.driver_id == driver_id)
    if accident_type:
        q = q.filter(Accident.accident_type == accident_type)
    return q


def by_type(db: Session, **filters) -> list[dict]:
    q = db.query(
        Accident.accident_type.label("type"),
        func.count(Accident.id).label("count"),
    )
    q = _apply_filters(q, **filters)
    rows = q.group_by(Accident.accident_type).order_by(desc("count")).all()
    return [{"type": r.type, "count": r.count} for r in rows]


def by_cause(db: Session, **filters) -> list[dict]:
    q = db.query(
        Accident.accident_cause.label("cause"),
        func.count(Accident.id).label("count"),
    )
    q = _apply_filters(q, **filters)
    rows = q.group_by(Accident.accident_cause).order_by(desc("count")).all()
    return [{"cause": r.cause, "count": r.count} for r in rows]


def by_day(db: Session, year: int, month: int, **filters) -> list[dict]:
    q = db.query(
        extract("day", Accident.accident_date).label("day"),
        func.count(Accident.id).label("count"),
    )
    q = _apply_filters(q, **filters)
    rows = (
        q.filter(extract("year", Accident.accident_date) == year)
        .filter(extract("month", Accident.accident_date) == month)
        .group_by("day")
        .order_by("day")
        .all()
    )
    return [{"day": int(r.day), "count": r.count} for r in rows]


def by_month(db: Session, **filters) -> list[dict]:
    """Динамика по месяцам/годам — для графика тренда."""
    q = db.query(
        extract("year", Accident.accident_date).label("year"),
        extract("month", Accident.accident_date).label("month"),
        func.count(Accident.id).label("count"),
    )
    q = _apply_filters(q, **filters)
    rows = q.group_by("year", "month").order_by("year", "month").all()
    return [
        {"year": int(r.year), "month": int(r.month), "count": r.count}
        for r in rows
    ]


def by_severity(db: Session, **filters) -> list[dict]:
    """Распределение по числу пострадавших с группировкой 4+."""
    q = db.query(
        Accident.victims_count.label("victims"),
        func.count(Accident.id).label("count"),
    )
    q = _apply_filters(q, **filters)
    rows = q.group_by(Accident.victims_count).order_by(Accident.victims_count).all()

    buckets = {"0": 0, "1": 0, "2": 0, "3": 0, "4+": 0}
    for r in rows:
        v = r.victims
        if v >= 4:
            buckets["4+"] += r.count
        else:
            buckets[str(v)] += r.count
    return [{"label": k, "count": v} for k, v in buckets.items()]


def by_location(db: Session, limit: int = 10, **filters) -> list[dict]:
    q = db.query(
        Accident.location,
        func.coalesce(func.sum(Accident.victims_count), 0).label("total_victims"),
    )
    q = _apply_filters(q, **filters)
    rows = (
        q.group_by(Accident.location)
        .order_by(desc("total_victims"))
        .limit(limit)
        .all()
    )
    return [{"location": r.location, "total_victims": int(r.total_victims)} for r in rows]


def summary(db: Session, **filters) -> dict:
    q_count = _apply_filters(db.query(func.count(Accident.id)), **filters)
    q_sum = _apply_filters(db.query(func.coalesce(func.sum(Accident.victims_count), 0)), **filters)
    total_accidents = q_count.scalar() or 0
    total_victims = q_sum.scalar() or 0

    q_top_type = _apply_filters(
        db.query(Accident.accident_type, func.count(Accident.id).label("c")),
        **filters,
    )
    top_type_row = q_top_type.group_by(Accident.accident_type).order_by(desc("c")).first()

    q_top_cause = _apply_filters(
        db.query(Accident.accident_cause, func.count(Accident.id).label("c")),
        **filters,
    )
    top_cause_row = q_top_cause.group_by(Accident.accident_cause).order_by(desc("c")).first()

    return {
        "total_accidents": int(total_accidents),
        "total_victims": int(total_victims),
        "top_type": top_type_row[0] if top_type_row else None,
        "top_cause": top_cause_row[0] if top_cause_row else None,
    }


# текущий и предыдущий 30-дневный период, динамика по дням, топ мест, последние ДТП
def dashboard(db: Session) -> dict:
    # Опорная дата — самая поздняя в БД (а не сегодня), чтобы дашборд работал и с тестовыми данными за прошлые годы.
    latest = db.query(func.max(Accident.accident_date)).scalar()
    if latest is None:
        return {
            "current_period": {"accidents": 0, "victims": 0},
            "previous_period": {"accidents": 0, "victims": 0},
            "daily_counts": [],
            "top_locations": [],
            "recent_accidents": [],
        }

    current_end = latest
    current_start = latest - timedelta(days=29)   # 30 дней
    previous_end = current_start - timedelta(days=1)
    previous_start = previous_end - timedelta(days=29)

    def period_stats(start: date, end: date) -> dict:
        acc = db.query(func.count(Accident.id)).filter(
            Accident.accident_date >= start,
            Accident.accident_date <= end,
        ).scalar() or 0
        vic = db.query(func.coalesce(func.sum(Accident.victims_count), 0)).filter(
            Accident.accident_date >= start,
            Accident.accident_date <= end,
        ).scalar() or 0
        return {"accidents": int(acc), "victims": int(vic)}

    current = period_stats(current_start, current_end)
    previous = period_stats(previous_start, previous_end)

    # Динамика по дням за текущий период
    daily_rows = (
        db.query(
            Accident.accident_date.label("date"),
            func.count(Accident.id).label("count"),
        )
        .filter(Accident.accident_date >= current_start, Accident.accident_date <= current_end)
        .group_by(Accident.accident_date)
        .order_by(Accident.accident_date)
        .all()
    )
    daily_counts = [{"date": r.date, "count": r.count} for r in daily_rows]

    # Топ-3 опасных места за всё время
    top_loc_rows = (
        db.query(Accident.location, func.count(Accident.id).label("count"))
        .group_by(Accident.location)
        .order_by(desc("count"))
        .limit(3)
        .all()
    )
    top_locations = [{"location": r.location, "count": r.count} for r in top_loc_rows]

    # Последние 5 ДТП с именем водителя
    recent_rows = (
        db.query(Accident, Driver.full_name.label("driver_name"))
        .outerjoin(Driver, Driver.id == Accident.driver_id)
        .order_by(desc(Accident.accident_date), desc(Accident.id))
        .limit(5)
        .all()
    )
    recent_accidents = [
        {
            "id": a.id,
            "act_number": a.act_number,
            "accident_date": a.accident_date,
            "location": a.location,
            "accident_type": a.accident_type,
            "victims_count": a.victims_count,
            "driver_name": driver_name,
        }
        for a, driver_name in recent_rows
    ]

    return {
        "current_period": current,
        "previous_period": previous,
        "daily_counts": daily_counts,
        "top_locations": top_locations,
        "recent_accidents": recent_accidents,
    }
