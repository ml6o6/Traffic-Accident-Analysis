from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.auth import UserPublic, RoleUpdate
from ..services import auth_service
from ..dependencies.auth import require_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserPublic])
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    return auth_service.list_users(db)


@router.patch("/{user_id}/role", response_model=UserPublic)
def set_role(
    user_id: int,
    payload: RoleUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return auth_service.set_role(db, user_id, payload.role)
