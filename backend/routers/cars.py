from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.car import CarCreate, CarUpdate, CarResponse
from ..services import car_service
from ..dependencies.auth import get_current_user, require_admin

router = APIRouter(prefix="/cars", tags=["cars"])


@router.get("", response_model=list[CarResponse])
def list_cars(
    search: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return car_service.list_cars(db, search)


@router.get("/{car_id}", response_model=CarResponse)
def get_car(car_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return car_service.get_car(db, car_id)


@router.post("", response_model=CarResponse, status_code=201)
def create_car(payload: CarCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return car_service.create_car(db, payload)


@router.put("/{car_id}", response_model=CarResponse)
def update_car(
    car_id: int,
    payload: CarUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return car_service.update_car(db, car_id, payload)


@router.delete("/{car_id}", status_code=204)
def delete_car(car_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    car_service.delete_car(db, car_id)
    return None
