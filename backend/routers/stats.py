from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.stats import (
    TypeStatRow,
    CauseStatRow,
    DayStatRow,
    LocationStatRow,
    MonthStatRow,
    SeverityStatRow,
    SummaryResponse,
    DashboardResponse,
)
from ..services import stats_service

# Публичный раздел: аналитические сводки доступны без аутентификации,
# поскольку содержат только агрегированные данные без персональной информации.
router = APIRouter(prefix="/stats", tags=["stats"])


def stats_filters(
    date_from: date | None = None,
    date_to: date | None = None,
    location: str | None = None,
    driver_id: int | None = None,
    accident_type: str | None = None,
) -> dict:
    """Общие фильтры статистики (date_from / date_to / location / driver_id / accident_type)."""
    return {
        "date_from": date_from,
        "date_to": date_to,
        "location": location,
        "driver_id": driver_id,
        "accident_type": accident_type,
    }


@router.get("/by-type", response_model=list[TypeStatRow])
def by_type(filters: dict = Depends(stats_filters), db: Session = Depends(get_db)):
    return stats_service.by_type(db, **filters)


@router.get("/by-cause", response_model=list[CauseStatRow])
def by_cause(filters: dict = Depends(stats_filters), db: Session = Depends(get_db)):
    return stats_service.by_cause(db, **filters)


@router.get("/by-day", response_model=list[DayStatRow])
def by_day(
    year: int = Query(..., ge=1900, le=2100),
    month: int = Query(..., ge=1, le=12),
    filters: dict = Depends(stats_filters),
    db: Session = Depends(get_db),
):
    return stats_service.by_day(db, year, month, **filters)


@router.get("/by-month", response_model=list[MonthStatRow])
def by_month(filters: dict = Depends(stats_filters), db: Session = Depends(get_db)):
    return stats_service.by_month(db, **filters)


@router.get("/by-severity", response_model=list[SeverityStatRow])
def by_severity(filters: dict = Depends(stats_filters), db: Session = Depends(get_db)):
    return stats_service.by_severity(db, **filters)


@router.get("/by-location", response_model=list[LocationStatRow])
def by_location(
    limit: int = Query(10, ge=1, le=100),
    filters: dict = Depends(stats_filters),
    db: Session = Depends(get_db),
):
    return stats_service.by_location(db, limit, **filters)


@router.get("/summary", response_model=SummaryResponse)
def summary(filters: dict = Depends(stats_filters), db: Session = Depends(get_db)):
    return stats_service.summary(db, **filters)


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db)):
    return stats_service.dashboard(db)
