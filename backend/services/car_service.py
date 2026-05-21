from fastapi import HTTPException
from sqlalchemy import update
from sqlalchemy.orm import Session

from ..models.car import Car
from ..models.driver import Driver
from ..models.accident import Accident
from ..models.accident_car import AccidentCar
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
    data = payload.model_dump(exclude_unset=True)

    new_reg = data.get("reg_number")
    old_reg = car.reg_number

    if new_reg and new_reg != old_reg:
        if db.query(Car).filter(Car.reg_number == new_reg, Car.id != car_id).first():
            raise HTTPException(
                status_code=400,
                detail=f"Авто с гос. номером «{new_reg}» уже существует",
            )
        new_car = Car(
            brand_company=data.get("brand_company", car.brand_company),
            brand_model=data.get("brand_model", car.brand_model),
            body_type=data.get("body_type", car.body_type),
            reg_number=new_reg,
        )
        db.add(new_car)
        db.flush()

        db.execute(update(Driver).where(Driver.car_reg_number == old_reg).values(car_reg_number=new_reg))
        db.execute(update(Accident).where(Accident.car_reg_number == old_reg).values(car_reg_number=new_reg))
        db.execute(update(AccidentCar).where(AccidentCar.car_reg_number == old_reg).values(car_reg_number=new_reg))

        db.delete(car)
        db.commit()
        db.refresh(new_car)
        return new_car

    for field, value in data.items():
        setattr(car, field, value)
    db.commit()
    db.refresh(car)
    return car


def delete_car(db: Session, car_id: int) -> None:
    car = get_car(db, car_id)

    if db.query(Driver).filter(Driver.car_reg_number == car.reg_number).first():
        raise HTTPException(
            status_code=400,
            detail="Нельзя удалить автомобиль: за ним закреплён хотя бы один водитель",
        )
    if db.query(Accident).filter(Accident.car_reg_number == car.reg_number).first():
        raise HTTPException(
            status_code=400,
            detail="Нельзя удалить автомобиль: на него ссылаются акты ДТП",
        )
    if db.query(AccidentCar).filter(AccidentCar.car_reg_number == car.reg_number).first():
        raise HTTPException(
            status_code=400,
            detail="Нельзя удалить автомобиль: он указан как участник ДТП",
        )

    db.delete(car)
    db.commit()
