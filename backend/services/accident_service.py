from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.accident import Accident
from ..models.accident_car import AccidentCar
from ..models.car import Car
from ..models.driver import Driver
from ..schemas.accident import AccidentCreate, AccidentUpdate


def list_accidents(
    db: Session,
    date_from: date | None = None,
    date_to: date | None = None,
    accident_type: str | None = None,
    accident_cause: str | None = None,
    location: str | None = None,
) -> list[Accident]:
    q = db.query(Accident)
    if date_from:
        q = q.filter(Accident.accident_date >= date_from)
    if date_to:
        q = q.filter(Accident.accident_date <= date_to)
    if accident_type:
        q = q.filter(Accident.accident_type == accident_type)
    if accident_cause:
        q = q.filter(Accident.accident_cause == accident_cause)
    if location:
        q = q.filter(Accident.location.ilike(f"%{location}%"))
    return q.order_by(Accident.accident_date.desc()).all()


def get_accident(db: Session, accident_id: int) -> Accident:
    a = db.get(Accident, accident_id)
    if not a:
        raise HTTPException(status_code=404, detail="Акт ДТП не найден")
    return a


def cars_of_accident(db: Session, accident: Accident) -> list[str]:
    """Список гос. номеров всех машин-участников акта (через accident_cars)."""
    rows = (
        db.query(AccidentCar.car_reg_number)
        .filter(AccidentCar.accident_id == accident.id)
        .all()
    )
    return [r[0] for r in rows]


def _validate_refs(db: Session, driver_id: int | None, car_reg_number: str | None,
                   car_reg_numbers: list[str] | None) -> None:
    if driver_id is not None:
        if not db.get(Driver, driver_id):
            raise HTTPException(status_code=400, detail=f"Водитель с id={driver_id} не найден")
    if car_reg_number:
        if not db.query(Car).filter(Car.reg_number == car_reg_number).first():
            raise HTTPException(
                status_code=400,
                detail=f"Автомобиль с гос. номером «{car_reg_number}» не найден",
            )
    if car_reg_numbers:
        for reg in car_reg_numbers:
            if not db.query(Car).filter(Car.reg_number == reg).first():
                raise HTTPException(
                    status_code=400,
                    detail=f"Автомобиль с гос. номером «{reg}» не найден",
                )


def create_accident(db: Session, payload: AccidentCreate) -> Accident:
    if db.query(Accident).filter(Accident.act_number == payload.act_number).first():
        raise HTTPException(
            status_code=400,
            detail="Акт с таким номером уже существует",
        )
    _validate_refs(db, payload.driver_id, payload.car_reg_number, payload.car_reg_numbers)

    data = payload.model_dump(mode="json", exclude={"car_reg_numbers"})
    accident = Accident(**data)
    db.add(accident)
    db.flush()

    # Связываем машины-участников через таблицу accident_cars
    for reg in payload.car_reg_numbers:
        db.add(AccidentCar(accident_id=accident.id, car_reg_number=reg))

    db.commit()
    db.refresh(accident)
    return accident


def update_accident(db: Session, accident_id: int, payload: AccidentUpdate) -> Accident:
    accident = get_accident(db, accident_id)
    data = payload.model_dump(exclude_unset=True, mode="json")

    cars_list = data.pop("car_reg_numbers", None)

    _validate_refs(
        db,
        data.get("driver_id"),
        data.get("car_reg_number"),
        cars_list,
    )

    for field, value in data.items():
        setattr(accident, field, value)

    if cars_list is not None:
        # Полная замена списка машин-участников
        db.query(AccidentCar).filter(AccidentCar.accident_id == accident.id).delete()
        for reg in cars_list:
            db.add(AccidentCar(accident_id=accident.id, car_reg_number=reg))

    db.commit()
    db.refresh(accident)
    return accident


def delete_accident(db: Session, accident_id: int) -> None:
    accident = get_accident(db, accident_id)
    db.delete(accident)
    db.commit()


def map_points(
    db: Session,
    date_from: date | None = None,
    date_to: date | None = None,
    accident_type: str | None = None,
    location: str | None = None,
) -> list[dict]:
    """Облегчённый список точек для карты (только записи с координатами)."""
    q = db.query(Accident).filter(
        Accident.latitude.isnot(None),
        Accident.longitude.isnot(None),
    )
    if date_from:
        q = q.filter(Accident.accident_date >= date_from)
    if date_to:
        q = q.filter(Accident.accident_date <= date_to)
    if accident_type:
        q = q.filter(Accident.accident_type == accident_type)
    if location:
        q = q.filter(Accident.location.ilike(f"%{location}%"))

    rows = q.order_by(Accident.accident_date.desc()).all()
    return [
        {
            "id": a.id,
            "lat": a.latitude,
            "lon": a.longitude,
            "accident_type": a.accident_type,
            "accident_cause": a.accident_cause,
            "accident_date": a.accident_date,
            "location": a.location,
            "victims_count": a.victims_count,
            "driver_name": a.driver.full_name if a.driver else None,
            "car_reg_number": a.car_reg_number,
        }
        for a in rows
    ]
