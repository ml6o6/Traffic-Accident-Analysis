from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.car import Car
from ..schemas.car import CarCreate, CarUpdate


def list_cars(db: Session, search: str | None = None) -> list[Car]:
    q = db.query(Car)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (Car.brand_company.ilike(like))
            | (Car.brand_model.ilike(like))
            | (Car.reg_number.ilike(like))
        )
    return q.order_by(Car.id).all()


def get_car(db: Session, car_id: int) -> Car:
    car = db.get(Car, car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    return car


def create_car(db: Session, payload: CarCreate) -> Car:
    if db.query(Car).filter(Car.reg_number == payload.reg_number).first():
        raise HTTPException(
            status_code=400,
            detail="Авто с таким гос. номером уже существует",
        )
    car = Car(**payload.model_dump())
    db.add(car)
    db.commit()
    db.refresh(car)
    return car


def update_car(db: Session, car_id: int, payload: CarUpdate) -> Car:
    car = get_car(db, car_id)
    patch = payload.model_dump(exclude_unset=True)
    if "reg_number" in patch and patch["reg_number"] != car.reg_number:
        existing = (
            db.query(Car)
            .filter(Car.reg_number == patch["reg_number"], Car.id != car_id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Авто с гос. номером «{patch['reg_number']}» уже существует",
            )
    for field, value in patch.items():
        setattr(car, field, value)
    db.commit()
    db.refresh(car)
    return car


def delete_car(db: Session, car_id: int) -> None:
    car = get_car(db, car_id)
    db.delete(car)
    db.commit()
