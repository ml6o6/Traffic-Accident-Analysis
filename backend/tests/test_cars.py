def test_list_requires_auth(client):
    r = client.get("/api/cars")
    assert r.status_code == 401


def test_create_car_admin_only(client, admin_headers, user_headers):
    payload = {
        "brand_company": "Lada",
        "brand_model": "Vesta",
        "body_type": "седан",
        "reg_number": "А001АА777",
    }
    # user не может создавать
    r = client.post("/api/cars", json=payload, headers=user_headers)
    assert r.status_code == 403

    # admin создаёт
    r = client.post("/api/cars", json=payload, headers=admin_headers)
    assert r.status_code == 201, r.text
    assert r.json()["reg_number"] == "А001АА777"


def test_duplicate_reg_number_rejected(client, admin_headers):
    payload = {
        "brand_company": "Lada",
        "brand_model": "Vesta",
        "body_type": "седан",
        "reg_number": "А001АА777",
    }
    client.post("/api/cars", json=payload, headers=admin_headers)
    r = client.post("/api/cars", json=payload, headers=admin_headers)
    assert r.status_code == 400


def test_search_by_brand(client, admin_headers):
    client.post(
        "/api/cars",
        json={"brand_company": "Lada", "brand_model": "Vesta", "body_type": "седан", "reg_number": "А001АА777"},
        headers=admin_headers,
    )
    client.post(
        "/api/cars",
        json={"brand_company": "BMW", "brand_model": "X5", "body_type": "внедорожник", "reg_number": "Н777НН777"},
        headers=admin_headers,
    )
    r = client.get("/api/cars?search=BMW", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 1
    assert data[0]["brand_company"] == "BMW"


def test_delete_car(client, admin_headers):
    created = client.post(
        "/api/cars",
        json={"brand_company": "Lada", "brand_model": "Vesta", "body_type": "седан", "reg_number": "А001АА777"},
        headers=admin_headers,
    ).json()
    r = client.delete(f"/api/cars/{created['id']}", headers=admin_headers)
    assert r.status_code == 204
    r = client.get(f"/api/cars/{created['id']}", headers=admin_headers)
    assert r.status_code == 404
