from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.driver import DriverCreate, DriverUpdate, DriverResponse
from ..services import driver_service

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.get("", response_model=list[DriverResponse])
def list_drivers(search: str | None = None, db: Session = Depends(get_db)):
    return driver_service.list_drivers(db, search)


@router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(driver_id: int, db: Session = Depends(get_db)):
    return driver_service.get_driver(db, driver_id)


@router.post("", response_model=DriverResponse, status_code=201)
def create_driver(payload: DriverCreate, db: Session = Depends(get_db)):
    return driver_service.create_driver(db, payload)


@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver(driver_id: int, payload: DriverUpdate, db: Session = Depends(get_db)):
    return driver_service.update_driver(db, driver_id, payload)


@router.delete("/{driver_id}", status_code=204)
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    driver_service.delete_driver(db, driver_id)
    return None
