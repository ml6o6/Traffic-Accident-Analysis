def _seed_basics(client, admin_headers):
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
    d = client.post(
        "/api/drivers",
        json={
            "full_name": "Иванов И.",
            "experience": 5,
            "car_reg_number": "А001АА777",
            "license_number": "77AB1",
            "license_date": "2018-01-01",
        },
        headers=admin_headers,
    )
    return d.json()["id"]


def test_create_accident_with_multiple_cars(client, admin_headers):
    driver_id = _seed_basics(client, admin_headers)
    payload = {
        "department_name": "ГИБДД №1",
        "act_number": "АКТ-1",
        "driver_id": driver_id,
        "car_reg_number": "А001АА777",
        "accident_date": "2025-06-10",
        "location": "ул. Ленина, 1",
        "latitude": 55.75,
        "longitude": 37.61,
        "victims_count": 2,
        "accident_type": "Столкновение",
        "accident_cause": "Превышение скорости",
        "car_reg_numbers": ["А001АА777", "Н777НН777"],
    }
    r = client.post("/api/accidents", json=payload, headers=admin_headers)
    assert r.status_code == 201, r.text
    assert set(r.json()["cars"]) == {"А001АА777", "Н777НН777"}


def test_create_with_unknown_driver_rejected(client, admin_headers):
    _seed_basics(client, admin_headers)
    payload = {
        "department_name": "ГИБДД",
        "act_number": "АКТ-2",
        "driver_id": 9999,
        "accident_date": "2025-06-10",
        "location": "ул. Тестовая",
        "victims_count": 0,
        "accident_type": "Столкновение",
        "accident_cause": "Превышение скорости",
        "car_reg_numbers": [],
    }
    r = client.post("/api/accidents", json=payload, headers=admin_headers)
    assert r.status_code == 400
    assert "Водитель" in r.json()["detail"]


def test_list_returns_driver_name(client, admin_headers):
    driver_id = _seed_basics(client, admin_headers)
    client.post(
        "/api/accidents",
        json={
            "department_name": "ГИБДД",
            "act_number": "АКТ-1",
            "driver_id": driver_id,
            "car_reg_number": "А001АА777",
            "accident_date": "2025-06-10",
            "location": "ул. Ленина",
            "victims_count": 1,
            "accident_type": "Столкновение",
            "accident_cause": "Прочее",
            "car_reg_numbers": [],
        },
        headers=admin_headers,
    )
    r = client.get("/api/accidents", headers=admin_headers)
    assert r.status_code == 200
    assert r.json()[0]["driver_name"] == "Иванов И."


def test_map_points_filter(client, admin_headers):
    driver_id = _seed_basics(client, admin_headers)
    for i, t in enumerate(["Столкновение", "Наезд на пешехода"]):
        client.post(
            "/api/accidents",
            json={
                "department_name": "ГИБДД",
                "act_number": f"АКТ-{i}",
                "driver_id": driver_id,
                "car_reg_number": "А001АА777",
                "accident_date": "2025-06-01",
                "location": "ул. Ленина",
                "latitude": 55.0 + i,
                "longitude": 37.0 + i,
                "victims_count": i,
                "accident_type": t,
                "accident_cause": "Прочее",
                "car_reg_numbers": [],
            },
            headers=admin_headers,
        )
    r = client.get("/api/accidents/map-points?accident_type=Наезд на пешехода", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 1
    assert data[0]["accident_type"] == "Наезд на пешехода"
