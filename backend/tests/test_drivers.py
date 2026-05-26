def _create_car(client, admin_headers, reg="А001АА777"):
    client.post(
        "/api/cars",
        json={"brand_company": "Lada", "brand_model": "Vesta", "body_type": "седан", "reg_number": reg},
        headers=admin_headers,
    )


def test_list_requires_auth(client):
    r = client.get("/api/drivers")
    assert r.status_code == 401


def test_create_driver_admin_only(client, admin_headers, user_headers):
    _create_car(client, admin_headers)
    payload = {
        "full_name": "Иванов И.И.",
        "experience": 5,
        "car_reg_number": "А001АА777",
        "license_number": "77AB000001",
        "license_date": "2018-01-15",
    }
    r = client.post("/api/drivers", json=payload, headers=user_headers)
    assert r.status_code == 403

    r = client.post("/api/drivers", json=payload, headers=admin_headers)
    assert r.status_code == 201, r.text
    assert r.json()["full_name"] == "Иванов И.И."


def test_create_driver_with_unknown_car_rejected(client, admin_headers):
    #Создаём водителя, указывая несуществующий reg_number автомобиля
    #если car_reg_number нет в cars — 400
    payload = {
        "full_name": "Иванов И.И.",
        "experience": 5,
        "car_reg_number": "Х999ХХ999",  # не существует
        "license_number": "77AB000001",
        "license_date": "2018-01-15",
    }
    r = client.post("/api/drivers", json=payload, headers=admin_headers)
    assert r.status_code == 400
    assert "не найден" in r.json()["detail"]


def test_duplicate_license_rejected(client, admin_headers):
    _create_car(client, admin_headers)
    payload = {
        "full_name": "Иванов И.И.",
        "experience": 5,
        "car_reg_number": "А001АА777",
        "license_number": "77AB000001",
        "license_date": "2018-01-15",
    }
    client.post("/api/drivers", json=payload, headers=admin_headers)
    payload["full_name"] = "Другой человек"
    r = client.post("/api/drivers", json=payload, headers=admin_headers)
    assert r.status_code == 400


def test_list_and_get(client, admin_headers):
    _create_car(client, admin_headers)
    created = client.post(
        "/api/drivers",
        json={
            "full_name": "Петров П.П.",
            "experience": 3,
            "car_reg_number": "А001АА777",
            "license_number": "77AB000002",
            "license_date": "2020-01-01",
        },
        headers=admin_headers,
    ).json()
    r = client.get("/api/drivers", headers=admin_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1
    r = client.get(f"/api/drivers/{created['id']}", headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["full_name"] == "Петров П.П."
