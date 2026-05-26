from sqlalchemy import func, extract, desc
from sqlalchemy.orm import Session

from ..models.accident import Accident

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

#Количество ДТП по причинам, от частых к редким.
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
