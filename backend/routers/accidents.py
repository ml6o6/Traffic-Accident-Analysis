from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.accident import (
    AccidentCreate,
    AccidentUpdate,
    AccidentResponse,
    AccidentListItem,
    AccidentMapPoint,
)
from ..services import accident_service
from ..dependencies.auth import (
    get_current_user,
    get_current_user_optional,
    require_admin,
)
from ..models.user import User, UserRole

router = APIRouter(prefix="/accidents", tags=["accidents"])


def _to_list_item(a) -> AccidentListItem:
    return AccidentListItem(
        id=a.id,
        act_number=a.act_number,
        accident_date=a.accident_date,
        location=a.location,
        accident_type=a.accident_type,
        accident_cause=a.accident_cause,
        victims_count=a.victims_count,
        driver_id=a.driver_id,
        driver_name=a.driver.full_name if a.driver else None,
        car_reg_number=a.car_reg_number,
    )


def _to_response(a, cars: list[str]) -> AccidentResponse:
    return AccidentResponse(
        id=a.id,
        department_name=a.department_name,
        act_number=a.act_number,
        driver_id=a.driver_id,
        car_reg_number=a.car_reg_number,
        accident_date=a.accident_date,
        location=a.location,
        latitude=a.latitude,
        longitude=a.longitude,
        victims_count=a.victims_count,
        accident_type=a.accident_type,
        accident_cause=a.accident_cause,
        cars=cars,
    )


@router.get("", response_model=list[AccidentListItem])
def list_accidents(
    date_from: date | None = None,
    date_to: date | None = None,
    accident_type: str | None = None,
    accident_cause: str | None = None,
    location: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    rows = accident_service.list_accidents(
        db, date_from, date_to, accident_type, accident_cause, location
    )
    return [_to_list_item(a) for a in rows]


@router.get("/map-points", response_model=list[AccidentMapPoint])
def get_map_points(
    date_from: date | None = None,
    date_to: date | None = None,
    accident_type: str | None = None,
    location: str | None = None,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    """Публичный эндпоинт. Для гостей скрываем ФИО водителя и гос. номер
    (персональные данные), оставляя только агрегатно-публичные поля."""
    points = accident_service.map_points(db, date_from, date_to, accident_type, location)
    is_admin = bool(user and user.role == UserRole.admin)
    if not is_admin:
        for p in points:
            # accident_service может вернуть как dict-like, так и Pydantic-объект
            if hasattr(p, "__setitem__"):
                p["driver_name"] = None
                p["car_reg_number"] = None
            else:
                p.driver_name = None
                p.car_reg_number = None
    return points


@router.get("/{accident_id}", response_model=AccidentResponse)
def get_accident(accident_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    a = accident_service.get_accident(db, accident_id)
    cars = accident_service.cars_of_accident(db, a)
    return _to_response(a, cars)


@router.post("", response_model=AccidentResponse, status_code=201)
def create_accident(
    payload: AccidentCreate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    a = accident_service.create_accident(db, payload)
    cars = accident_service.cars_of_accident(db, a)
    return _to_response(a, cars)


@router.put("/{accident_id}", response_model=AccidentResponse)
def update_accident(
    accident_id: int,
    payload: AccidentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    a = accident_service.update_accident(db, accident_id, payload)
    cars = accident_service.cars_of_accident(db, a)
    return _to_response(a, cars)


@router.delete("/{accident_id}", status_code=204)
def delete_accident(accident_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    accident_service.delete_accident(db, accident_id)
    return None
