from datetime import date, timedelta

from sqlalchemy import func, extract, desc
from sqlalchemy.orm import Session

from ..models.accident import Accident
from ..models.driver import Driver

#Количество ДТП по видам,  от частых к редким
def by_type(db: Session) -> list[dict]:
    rows = (
        db.query(
            Accident.accident_type.label("type"),
            func.count(Accident.id).label("count"),
        )
        .group_by(Accident.accident_type)
        .order_by(desc("count"))
        .all()
    )
    return [{"type": r.type, "count": r.count} for r in rows]

#Количество ДТП по причинам, от частых к редким
def by_cause(db: Session) -> list[dict]:
    rows = (
        db.query(
            Accident.accident_cause.label("cause"),
            func.count(Accident.id).label("count"),
        )
        .group_by(Accident.accident_cause)
        .order_by(desc("count"))
        .all()
    )
    return [{"cause": r.cause, "count": r.count} for r in rows]

#Количество ДТП за каждый день указанного месяца
def by_day(db: Session, year: int, month: int) -> list[dict]:
    rows = (
        db.query(
            extract("day", Accident.accident_date).label("day"),
            func.count(Accident.id).label("count"),
        )
        .filter(extract("year", Accident.accident_date) == year)
        .filter(extract("month", Accident.accident_date) == month)
        .group_by("day")
        .order_by("day")
        .all()
    )
    return [{"day": int(r.day), "count": r.count} for r in rows]

#Топ-N мест по суммарному числу пострадавших
def by_location(db: Session, limit: int = 10) -> list[dict]:
    rows = (
        db.query(
            Accident.location,
            func.coalesce(func.sum(Accident.victims_count), 0).label("total_victims"),
        )
        .group_by(Accident.location)
        .order_by(desc("total_victims"))
        .limit(limit)
        .all()
    )
    return [{"location": r.location, "total_victims": int(r.total_victims)} for r in rows]

#Сводка: всего ДТП, всего пострадавших, самый частый вид и причина
def summary(db: Session) -> dict:
    total_accidents = db.query(func.count(Accident.id)).scalar() or 0
    total_victims = db.query(func.coalesce(func.sum(Accident.victims_count), 0)).scalar() or 0

    top_type_row = (
        db.query(Accident.accident_type, func.count(Accident.id).label("c"))
        .group_by(Accident.accident_type)
        .order_by(desc("c"))
        .first()
    )
    top_cause_row = (
        db.query(Accident.accident_cause, func.count(Accident.id).label("c"))
        .group_by(Accident.accident_cause)
        .order_by(desc("c"))
        .first()
    )

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
