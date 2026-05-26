from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.reports import (
    MultiAccidentDriver,
    DriverAccidentRow,
    MaxVictimsAccident,
    PedestrianDriver,
    CauseFrequencyRow,
)
from ..services import report_service
from ..dependencies.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/multi-accident-drivers", response_model=list[MultiAccidentDriver])
#Отчёт 1: водители, попавшие более чем в одно ДТП
def multi_accident_drivers(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return report_service.multi_accident_drivers(db)


@router.get("/drivers-by-location", response_model=list[DriverAccidentRow])
#Отчёт 2: водители, попавшие в ДТП по указанному месту
def drivers_by_location(
    location: str = Query(..., min_length=1, description="Часть адреса для поиска"),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return report_service.drivers_by_location(db, location)


@router.get("/drivers-by-date", response_model=list[DriverAccidentRow])
#Отчёт 3: водители, попавшие в ДТП на указанную дату
def drivers_by_date(
    target_date: date = Query(..., alias="date", description="Дата ДТП (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return report_service.drivers_by_date(db, target_date)


@router.get("/max-victims-accident", response_model=MaxVictimsAccident)
#Отчёт 4: акт ДТП с максимальным числом пострадавших
def max_victims_accident(db: Session = Depends(get_db), _=Depends(get_current_user)):
    row = report_service.max_victims_accident(db)
    if not row:
        raise HTTPException(status_code=404, detail="В базе пока нет ни одного акта ДТП")
    return row


@router.get("/pedestrian-drivers", response_model=list[PedestrianDriver])
#Отчёт 5: водители с min_count и более наездами на пешехода
def pedestrian_drivers(
    min_count: int = Query(3, ge=1, le=100, description="Минимальное число наездов на пешехода"),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return report_service.pedestrian_drivers(db, min_count)


@router.get("/causes-by-frequency", response_model=list[CauseFrequencyRow])
#Отчёт 6: причины ДТП в порядке убывания, с процентной долей
def causes_by_frequency(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return report_service.causes_by_frequency(db)
