from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.driver import Driver
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


def create_driver(db: Session, payload: DriverCreate) -> Driver:
    if db.query(Driver).filter(Driver.license_number == payload.license_number).first():
        raise HTTPException(
            status_code=400,
            detail="Удостоверение с таким номером уже существует",
        )
    data = _normalize(payload.model_dump())
    driver = Driver(**data)
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


def update_driver(db: Session, driver_id: int, payload: DriverUpdate) -> Driver:
    driver = get_driver(db, driver_id)
    patch = _normalize(payload.model_dump(exclude_unset=True))
    for field, value in patch.items():
        setattr(driver, field, value)
    db.commit()
    db.refresh(driver)
    return driver


def delete_driver(db: Session, driver_id: int) -> None:
    driver = get_driver(db, driver_id)
    db.delete(driver)
    db.commit()
