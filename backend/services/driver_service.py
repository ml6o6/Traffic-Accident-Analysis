from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.driver import Driver
from ..models.car import Car
from ..models.accident import Accident
from ..schemas.driver import DriverCreate, DriverUpdate


def list_drivers(db: Session, search: str | None = None) -> list[Driver]:
    q = db.query(Driver)
    if search:
        like = f"%{search}%"
        q = q.filter(Driver.full_name.ilike(like))
    return q.order_by(Driver.id).all()


def get_driver(db: Session, driver_id: int) -> Driver:
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Водитель не найден")
    return driver


def _normalize(data: dict) -> dict:
    """Пустые строки во внешних ссылках превращаем в None."""
    for key in ("car_reg_number", "act_number"):
        if key in data and data[key] == "":
            data[key] = None
    return data


def _validate_refs(db: Session, car_reg_number: str | None, act_number: str | None) -> None:
    if car_reg_number:
        if not db.query(Car).filter(Car.reg_number == car_reg_number).first():
            raise HTTPException(
                status_code=400,
                detail=f"Автомобиль с гос. номером «{car_reg_number}» не найден",
            )
    if act_number:
        if not db.query(Accident).filter(Accident.act_number == act_number).first():
            raise HTTPException(
                status_code=400,
                detail=f"Акт ДТП с номером «{act_number}» не найден. "
                       f"Сначала зарегистрируйте ДТП с этим номером акта.",
            )


def driver_accident_history(db: Session, driver_id: int) -> list[Accident]:
    get_driver(db, driver_id)
    return (
        db.query(Accident)
        .filter(Accident.driver_id == driver_id)
        .order_by(Accident.accident_date.desc())
        .all()
    )


def create_driver(db: Session, payload: DriverCreate) -> Driver:
    if db.query(Driver).filter(Driver.license_number == payload.license_number).first():
        raise HTTPException(
            status_code=400,
            detail="Удостоверение с таким номером уже существует",
        )
    data = _normalize(payload.model_dump())
    _validate_refs(db, data.get("car_reg_number"), data.get("act_number"))
    driver = Driver(**data)
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


def update_driver(db: Session, driver_id: int, payload: DriverUpdate) -> Driver:
    driver = get_driver(db, driver_id)
    data = _normalize(payload.model_dump(exclude_unset=True))
    _validate_refs(
        db,
        data.get("car_reg_number") if "car_reg_number" in data else None,
        data.get("act_number") if "act_number" in data else None,
    )
    for field, value in data.items():
        setattr(driver, field, value)
    db.commit()
    db.refresh(driver)
    return driver


def delete_driver(db: Session, driver_id: int) -> None:
    driver = get_driver(db, driver_id)
    if db.query(Accident).filter(Accident.driver_id == driver_id).first():
        raise HTTPException(
            status_code=400,
            detail="Нельзя удалить водителя, с которым связаны акты ДТП",
        )
    db.delete(driver)
    db.commit()
