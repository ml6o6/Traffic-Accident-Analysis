from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.accident import Accident
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


def create_accident(db: Session, payload: AccidentCreate) -> Accident:
    if db.query(Accident).filter(Accident.act_number == payload.act_number).first():
        raise HTTPException(
            status_code=400,
            detail="Акт с таким номером уже существует",
        )
    accident = Accident(**payload.model_dump(mode="json"))
    db.add(accident)
    db.commit()
    db.refresh(accident)
    return accident


def update_accident(db: Session, accident_id: int, payload: AccidentUpdate) -> Accident:
    accident = get_accident(db, accident_id)
    patch = payload.model_dump(exclude_unset=True, mode="json")
    for field, value in patch.items():
        setattr(accident, field, value)
    db.commit()
    db.refresh(accident)
    return accident


def delete_accident(db: Session, accident_id: int) -> None:
    accident = get_accident(db, accident_id)
    db.delete(accident)
    db.commit()
