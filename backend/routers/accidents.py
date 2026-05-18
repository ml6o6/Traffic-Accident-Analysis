from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.accident import AccidentCreate, AccidentUpdate, AccidentResponse
from ..services import accident_service

router = APIRouter(prefix="/accidents", tags=["accidents"])


@router.get("", response_model=list[AccidentResponse])
def list_accidents(
    date_from: date | None = None,
    date_to: date | None = None,
    accident_type: str | None = None,
    accident_cause: str | None = None,
    location: str | None = None,
    db: Session = Depends(get_db),
):
    return accident_service.list_accidents(
        db, date_from, date_to, accident_type, accident_cause, location
    )


@router.get("/{accident_id}", response_model=AccidentResponse)
def get_accident(accident_id: int, db: Session = Depends(get_db)):
    return accident_service.get_accident(db, accident_id)


@router.post("", response_model=AccidentResponse, status_code=201)
def create_accident(payload: AccidentCreate, db: Session = Depends(get_db)):
    return accident_service.create_accident(db, payload)


@router.put("/{accident_id}", response_model=AccidentResponse)
def update_accident(accident_id: int, payload: AccidentUpdate, db: Session = Depends(get_db)):
    return accident_service.update_accident(db, accident_id, payload)


@router.delete("/{accident_id}", status_code=204)
def delete_accident(accident_id: int, db: Session = Depends(get_db)):
    accident_service.delete_accident(db, accident_id)
    return None
