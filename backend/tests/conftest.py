import os
import tempfile

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# ВАЖНО: переопределяем настройки ДО импорта backend-модулей,
# чтобы engine был создан с SQLite, а не с PostgreSQL.
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///./_pytest_bootstrap.db")

from backend.db import Base, get_db  # noqa: E402
from backend.main import app  # noqa: E402
from backend.models.user import User, UserRole  # noqa: E402
from backend.dependencies.auth import hash_password  # noqa: E402


@pytest.fixture
def db_path():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    yield path
    try:
        os.remove(path)
    except OSError:
        pass


@pytest.fixture
def engine(db_path):
    eng = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=eng)
    yield eng
    eng.dispose()


@pytest.fixture
def session(engine):
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    s = TestingSessionLocal()
    try:
        yield s
    finally:
        s.close()


@pytest.fixture
def client(engine):
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # Сидим admin и user
    s = TestingSessionLocal()
    s.add(User(
        username="admin",
        password_hash=hash_password("admin123"),
        role=UserRole.admin.value,
        is_active=True,
    ))
    s.add(User(
        username="user",
        password_hash=hash_password("user123"),
        role=UserRole.user.value,
        is_active=True,
    ))
    s.commit()
    s.close()

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


def _token(client, username, password):
    r = client.post("/api/auth/login", json={"username": username, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture
def admin_headers(client):
    return {"Authorization": f"Bearer {_token(client, 'admin', 'admin123')}"}


@pytest.fixture
def user_headers(client):
    return {"Authorization": f"Bearer {_token(client, 'user', 'user123')}"}
