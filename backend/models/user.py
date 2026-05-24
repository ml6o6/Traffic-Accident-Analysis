import enum

from sqlalchemy import Column, Integer, String, Boolean

from ..db import Base


class UserRole(str, enum.Enum):
    """Роли пользователей. Валидируются на уровне Pydantic-схем; в БД хранится строкой."""
    admin = "admin"
    user = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(16), nullable=False, default=UserRole.user.value)
    is_active = Column(Boolean, nullable=False, default=True)
