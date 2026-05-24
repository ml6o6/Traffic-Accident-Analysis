from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies.auth import hash_password, verify_password, create_access_token
from ..models.user import User, UserRole
from ..schemas.auth import UserCreate, Token, UserPublic


def register_user(db: Session, payload: UserCreate) -> User:
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким именем уже существует",
        )
    user = User(
        username=payload.username,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, username: str, password: str) -> Token:
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash) or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
        )
    token = create_access_token(subject=user.username, role=user.role.value)
    return Token(access_token=token, user=UserPublic.model_validate(user))


def list_users(db: Session) -> list[User]:
    return db.query(User).order_by(User.id).all()


def set_role(db: Session, user_id: int, role: UserRole) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.role = role
    db.commit()
    db.refresh(user)
    return user
