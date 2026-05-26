from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.stats import (
    TypeStatRow,
    CauseStatRow,
    DayStatRow,
    LocationStatRow,
    SummaryResponse,
)
from ..services import stats_service
from ..dependencies.auth import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/by-type", response_model=list[TypeStatRow])
def by_type(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return stats_service.by_type(db)


@router.get("/by-cause", response_model=list[CauseStatRow])
def by_cause(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return stats_service.by_cause(db)


@router.get("/by-day", response_model=list[DayStatRow])
def by_day(
    year: int = Query(..., ge=1900, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return stats_service.by_day(db, year, month)


@router.get("/by-location", response_model=list[LocationStatRow])
def by_location(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return stats_service.by_location(db, limit)


@router.get("/summary", response_model=SummaryResponse)
def summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return stats_service.summary(db)
