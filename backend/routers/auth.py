from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.auth import UserCreate, UserLogin, Token, UserPublic
from ..services import auth_service
from ..dependencies.auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, payload)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    return auth_service.authenticate(db, payload.username, payload.password)


@router.post("/login/form", response_model=Token, include_in_schema=False)
def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 form-вариант логина — нужен для авторизации в Swagger UI."""
    return auth_service.authenticate(db, form.username, form.password)


@router.get("/me", response_model=UserPublic)
def me(current: User = Depends(get_current_user)):
    return current
