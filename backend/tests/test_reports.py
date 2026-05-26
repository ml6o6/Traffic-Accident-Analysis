import pytest


@pytest.fixture
def seeded(client, admin_headers):
    """Создаёт два водителя и 6 ДТП с разным распределением.

    driver1 (Иванов): 4 ДТП в т.ч. 3 наезда на пешехода
    driver2 (Петров): 2 ДТП
    """
    client.post(
        "/api/cars",
        json={"brand_company": "Lada", "brand_model": "Vesta", "body_type": "седан", "reg_number": "А001АА777"},
        headers=admin_headers,
    )
    d1 = client.post(
        "/api/drivers",
        json={
            "full_name": "Иванов И.И.",
            "experience": 5,
            "car_reg_number": "А001АА777",
            "license_number": "77AB000001",
            "license_date": "2018-01-15",
        },
        headers=admin_headers,
    ).json()
    d2 = client.post(
        "/api/drivers",
        json={
            "full_name": "Петров П.П.",
            "experience": 10,
            "car_reg_number": "А001АА777",
            "license_number": "77AB000002",
            "license_date": "2015-06-10",
        },
        headers=admin_headers,
    ).json()

    rows = [
        # driver1: 3 наезда на пешехода + 1 столкновение
        ("АКТ-1", d1["id"], "2025-06-01", "ул. Ленина, 5", 1, "Наезд на пешехода", "Превышение скорости"),
        ("АКТ-2", d1["id"], "2025-06-05", "ул. Ленина, 5", 2, "Наезд на пешехода", "Нарушение ПДД"),
        ("АКТ-3", d1["id"], "2025-06-10", "Тверская, 3", 1, "Наезд на пешехода", "Состояние водителя"),
        ("АКТ-4", d1["id"], "2025-06-15", "ул. Ленина, 5", 5, "Столкновение", "Превышение скорости"),
        # driver2: 2 столкновения
        ("АКТ-5", d2["id"], "2025-06-20", "пр-т Мира, 10", 1, "Столкновение", "Превышение скорости"),
        ("АКТ-6", d2["id"], "2025-06-20", "пр-т Мира, 10", 0, "Столкновение", "Нарушение ПДД"),
    ]
    for act, did, dt, loc, victims, t, c in rows:
        r = client.post(
            "/api/accidents",
            json={
                "department_name": "ГИБДД",
                "act_number": act,
                "driver_id": did,
                "car_reg_number": "А001АА777",
                "accident_date": dt,
                "location": loc,
                "victims_count": victims,
                "accident_type": t,
                "accident_cause": c,
                "car_reg_numbers": [],
            },
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
    return d1, d2


def test_reports_require_auth(client):
    r = client.get("/api/reports/multi-accident-drivers")
    assert r.status_code == 401


def test_multi_accident_drivers(client, user_headers, seeded):
    r = client.get("/api/reports/multi-accident-drivers", headers=user_headers)
    assert r.status_code == 200
    rows = r.json()
    # оба водителя имеют > 1 ДТП
    by_name = {r["full_name"]: r["accident_count"] for r in rows}
    assert by_name["Иванов И.И."] == 4
    assert by_name["Петров П.П."] == 2
    # отсортировано по убыванию
    assert rows[0]["full_name"] == "Иванов И.И."


def test_drivers_by_location(client, user_headers, seeded):
    r = client.get("/api/reports/drivers-by-location?location=Ленина", headers=user_headers)
    assert r.status_code == 200
    # На ул. Ленина у Иванова 3 ДТП (АКТ-1, АКТ-2, АКТ-4)
    rows = r.json()
    assert len(rows) == 3
    assert all("Ленина" in row["location"] for row in rows)


def test_drivers_by_location_empty_param(client, user_headers):
    r = client.get("/api/reports/drivers-by-location?location=", headers=user_headers)
    # 422 от валидации Query (min_length=1)
    assert r.status_code == 422


def test_drivers_by_date(client, user_headers, seeded):
    r = client.get("/api/reports/drivers-by-date?date=2025-06-20", headers=user_headers)
    assert r.status_code == 200
    rows = r.json()
    # на 20 июня — 2 ДТП Петрова
    assert len(rows) == 2
    assert all(r["full_name"] == "Петров П.П." for r in rows)


def test_drivers_by_date_invalid(client, user_headers):
    r = client.get("/api/reports/drivers-by-date?date=not-a-date", headers=user_headers)
    assert r.status_code == 422


def test_max_victims_accident(client, user_headers, seeded):
    r = client.get("/api/reports/max-victims-accident", headers=user_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["victims_count"] == 5
    assert data["act_number"] == "АКТ-4"
    assert data["driver_full_name"] == "Иванов И.И."


def test_max_victims_empty_db(client, user_headers):
    r = client.get("/api/reports/max-victims-accident", headers=user_headers)
    assert r.status_code == 404


def test_pedestrian_drivers(client, user_headers, seeded):
    r = client.get("/api/reports/pedestrian-drivers", headers=user_headers)
    assert r.status_code == 200
    rows = r.json()
    # Иванов имеет 3 наезда — попадает
    assert len(rows) == 1
    assert rows[0]["full_name"] == "Иванов И.И."
    assert rows[0]["pedestrian_count"] == 3


def test_pedestrian_drivers_custom_threshold(client, user_headers, seeded):
    r = client.get("/api/reports/pedestrian-drivers?min_count=5", headers=user_headers)
    assert r.status_code == 200
    # никто не имеет 5+ наездов
    assert r.json() == []


def test_causes_by_frequency(client, user_headers, seeded):
    r = client.get("/api/reports/causes-by-frequency", headers=user_headers)
    assert r.status_code == 200
    rows = r.json()
    # 6 ДТП в seeded; "Превышение скорости" 3 раза → 50%
    speeding = next(r for r in rows if r["cause"] == "Превышение скорости")
    assert speeding["count"] == 3
    assert speeding["percentage"] == 50.0
    # сумма процентов = 100
    assert abs(sum(r["percentage"] for r in rows) - 100.0) < 0.5
