def test_list_users_requires_auth(client):
    r = client.get("/api/users")
    assert r.status_code == 401


def test_list_users_forbidden_for_regular_user(client, user_headers):
    r = client.get("/api/users", headers=user_headers)
    assert r.status_code == 403
    assert "администратора" in r.json()["detail"]


def test_list_users_admin_ok(client, admin_headers):
    r = client.get("/api/users", headers=admin_headers)
    assert r.status_code == 200
    usernames = {u["username"] for u in r.json()}
    assert {"admin", "user"} <= usernames


def test_list_users_role_and_active_flag(client, admin_headers):
    rows = client.get("/api/users", headers=admin_headers).json()
    admin = next(u for u in rows if u["username"] == "admin")
    assert admin["role"] == "admin"
    assert admin["is_active"] is True


def _find_user_id(client, admin_headers, username):
    rows = client.get("/api/users", headers=admin_headers).json()
    return next(u["id"] for u in rows if u["username"] == username)


def test_set_role_promotes_user_to_admin(client, admin_headers):
    uid = _find_user_id(client, admin_headers, "user")
    r = client.patch(
        f"/api/users/{uid}/role",
        json={"role": "admin"},
        headers=admin_headers,
    )
    assert r.status_code == 200
    assert r.json()["role"] == "admin"


def test_set_role_demotes_admin_to_user(client, admin_headers):
    uid = _find_user_id(client, admin_headers, "admin")
    r = client.patch(
        f"/api/users/{uid}/role",
        json={"role": "user"},
        headers=admin_headers,
    )
    assert r.status_code == 200
    assert r.json()["role"] == "user"


def test_set_role_forbidden_for_regular_user(client, user_headers, admin_headers):
    uid = _find_user_id(client, admin_headers, "user")
    r = client.patch(
        f"/api/users/{uid}/role",
        json={"role": "admin"},
        headers=user_headers,
    )
    assert r.status_code == 403


def test_set_role_user_not_found(client, admin_headers):
    r = client.patch(
        "/api/users/9999/role",
        json={"role": "admin"},
        headers=admin_headers,
    )
    assert r.status_code == 404


def test_set_role_invalid_value(client, admin_headers):
    uid = _find_user_id(client, admin_headers, "user")
    r = client.patch(
        f"/api/users/{uid}/role",
        json={"role": "superuser"},
        headers=admin_headers,
    )
    assert r.status_code == 422
