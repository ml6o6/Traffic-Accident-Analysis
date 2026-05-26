def test_login_success_admin(client):
    r = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]
    assert data["user"]["username"] == "admin"
    assert data["user"]["role"] == "admin"


def test_login_success_user(client):
    r = client.post("/api/auth/login", json={"username": "user", "password": "user123"})
    assert r.status_code == 200, r.text
    assert r.json()["user"]["role"] == "user"


def test_login_wrong_password(client):
    r = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert r.status_code == 401
    assert "Неверный" in r.json()["detail"]


def test_login_unknown_user(client):
    r = client.post("/api/auth/login", json={"username": "nobody", "password": "anything"})
    assert r.status_code == 401


def test_login_form_endpoint(client):
    r = client.post(
        "/api/auth/login/form",
        data={"username": "admin", "password": "admin123"},
    )
    assert r.status_code == 200
    assert r.json()["access_token"]


def test_me_returns_current_user(client, admin_headers):
    r = client.get("/api/auth/me", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["username"] == "admin"
    assert data["role"] == "admin"
    assert data["is_active"] is True


def test_me_requires_auth(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401


def test_me_rejects_invalid_token(client):
    r = client.get("/api/auth/me", headers={"Authorization": "Bearer not.a.real.token"})
    assert r.status_code == 401


def test_register_creates_user(client):
    r = client.post(
        "/api/auth/register",
        json={"username": "newbie", "password": "secret123", "role": "user"},
    )
    assert r.status_code == 201, r.text
    assert r.json()["username"] == "newbie"
    # Созданный пользователь может войти
    login = client.post("/api/auth/login", json={"username": "newbie", "password": "secret123"})
    assert login.status_code == 200


def test_register_duplicate_username(client):
    r = client.post(
        "/api/auth/register",
        json={"username": "admin", "password": "anypass", "role": "user"},
    )
    assert r.status_code == 400
    assert "уже существует" in r.json()["detail"]


def test_register_short_password_rejected(client):
    r = client.post(
        "/api/auth/register",
        json={"username": "shortpw", "password": "x", "role": "user"},
    )
    assert r.status_code == 422
