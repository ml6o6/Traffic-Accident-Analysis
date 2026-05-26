from datetime import date

from fastapi import HTTPException
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from ..models.accident import Accident
from ..models.driver import Driver


PEDESTRIAN_TYPE = "Наезд на пешехода"

#Отчёт 1: водители, попавшие в более чем одно ДТП
def multi_accident_drivers(db: Session) -> list[dict]:
    rows = (
        db.query(
            Driver.id.label("driver_id"),
            Driver.full_name,
            Driver.license_number,
            func.count(Accident.id).label("accident_count"),
        )
        .join(Accident, Accident.driver_id == Driver.id)
        .group_by(Driver.id, Driver.full_name, Driver.license_number)
        .having(func.count(Accident.id) > 1)
        .order_by(desc("accident_count"))
        .all()
    )
    return [
        {
            "driver_id": r.driver_id,
            "full_name": r.full_name,
            "license_number": r.license_number,
            "accident_count": r.accident_count,
        }
        for r in rows
    ]

#Отчёт 2: водители, попавшие в ДТП на указанном месте
def drivers_by_location(db: Session, location: str) -> list[dict]:
    if not location.strip():
        raise HTTPException(status_code=400, detail="Параметр location не должен быть пустым")
    rows = (
        db.query(
            Driver.id.label("driver_id"),
            Driver.full_name,
            Accident.car_reg_number,
            Accident.accident_date,
            Accident.location,
            Accident.accident_type,
            Accident.accident_cause,
        )
        .join(Accident, Accident.driver_id == Driver.id)
        .filter(Accident.location.ilike(f"%{location}%"))
        .order_by(desc(Accident.accident_date))
        .all()
    )
    return [
        {
            "driver_id": r.driver_id,
            "full_name": r.full_name,
            "car_reg_number": r.car_reg_number,
            "accident_date": r.accident_date,
            "location": r.location,
            "accident_type": r.accident_type,
            "accident_cause": r.accident_cause,
        }
        for r in rows
    ]

 #Отчёт 3: водители, попавшие в ДТП на указанную дату
def drivers_by_date(db: Session, target_date: date) -> list[dict]:
    rows = (
        db.query(
            Driver.id.label("driver_id"),
            Driver.full_name,
            Accident.car_reg_number,
            Accident.accident_date,
            Accident.location,
            Accident.accident_type,
            Accident.accident_cause,
        )
        .join(Accident, Accident.driver_id == Driver.id)
        .filter(Accident.accident_date == target_date)
        .order_by(Driver.full_name)
        .all()
    )
    return [
        {
            "driver_id": r.driver_id,
            "full_name": r.full_name,
            "car_reg_number": r.car_reg_number,
            "accident_date": r.accident_date,
            "location": r.location,
            "accident_type": r.accident_type,
            "accident_cause": r.accident_cause,
        }
        for r in rows
    ]

#Отчёт 4: акт ДТП с максимальным числом пострадавших
def max_victims_accident(db: Session) -> dict | None:
    row = (
        db.query(Accident, Driver.full_name)
        .join(Driver, Driver.id == Accident.driver_id)
        .order_by(desc(Accident.victims_count))
        .first()
    )
    if not row:
        return None
    a, driver_full_name = row
    return {
        "id": a.id,
        "act_number": a.act_number,
        "accident_date": a.accident_date,
        "location": a.location,
        "victims_count": a.victims_count,
        "accident_type": a.accident_type,
        "accident_cause": a.accident_cause,
        "driver_id": a.driver_id,
        "driver_full_name": driver_full_name,
        "car_reg_number": a.car_reg_number,
    }

#Отчёт 5: водители с min_count и более наездами на пешехода
def pedestrian_drivers(db: Session, min_count: int = 3) -> list[dict]:
    rows = (
        db.query(
            Driver.id.label("driver_id"),
            Driver.full_name,
            Driver.license_number,
            func.count(Accident.id).label("pedestrian_count"),
        )
        .join(Accident, Accident.driver_id == Driver.id)
        .filter(Accident.accident_type == PEDESTRIAN_TYPE)
        .group_by(Driver.id, Driver.full_name, Driver.license_number)
        .having(func.count(Accident.id) >= min_count)
        .order_by(desc("pedestrian_count"))
        .all()
    )
    return [
        {
            "driver_id": r.driver_id,
            "full_name": r.full_name,
            "license_number": r.license_number,
            "pedestrian_count": r.pedestrian_count,
        }
        for r in rows
    ]

#Отчёт 6: причины ДТП в порядке убывания, с долей от общего числа
def causes_by_frequency(db: Session) -> list[dict]:
    rows = (
        db.query(
            Accident.accident_cause.label("cause"),
            func.count(Accident.id).label("count"),
        )
        .group_by(Accident.accident_cause)
        .order_by(desc("count"))
        .all()
    )
    total = sum(r.count for r in rows) or 1
    return [
        {
            "cause": r.cause,
            "count": r.count,
            "percentage": round(r.count * 100 / total, 2),
        }
        for r in rows
    ]
