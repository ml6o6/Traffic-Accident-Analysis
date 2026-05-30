import pytest

# Тесты для аналитических эндпоинтов. Проверяем, что они работают, возвращают правильные данные и не раскрывают лишнюю информацию гостям.
@pytest.fixture
def seeded(client, admin_headers):
    client.post(
        "/api/cars",
        json={"brand_company": "Lada", "brand_model": "Vesta", "body_type": "седан", "reg_number": "А001АА777"},
        headers=admin_headers,
    )
    driver = client.post(
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

    accidents = [
        ("АКТ-1", "2025-06-01", "ул. Ленина, 1", 2, "Столкновение", "Превышение скорости"),
        ("АКТ-2", "2025-06-01", "ул. Ленина, 1", 1, "Столкновение", "Превышение скорости"),
        ("АКТ-3", "2025-06-05", "пр-т Мира, 10", 0, "Столкновение", "Нарушение ПДД"),
        ("АКТ-4", "2025-06-10", "ул. Ленина, 1", 3, "Наезд на пешехода", "Нарушение ПДД"),
        ("АКТ-5", "2025-06-15", "Тверская, 7", 1, "Наезд на пешехода", "Состояние водителя"),
    ]
    for act, dt, loc, victims, t, c in accidents:
        r = client.post(
            "/api/accidents",
            json={
                "department_name": "ГИБДД",
                "act_number": act,
                "driver_id": driver["id"],
                "car_reg_number": "А001АА777",
                "accident_date": dt,
                "location": loc,
                "latitude": 55.7,
                "longitude": 37.6,
                "victims_count": victims,
                "accident_type": t,
                "accident_cause": c,
                "car_reg_numbers": [],
            },
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text


def test_stats_is_public(client, seeded):
    """Аналитические сводки публичны: доступ без токена должен работать."""
    r = client.get("/api/stats/summary")
    assert r.status_code == 200
    assert "total_accidents" in r.json()


def test_map_points_public_without_pii(client, seeded):
    """Карта публична, но ФИО водителя и гос. номер скрыты для гостя."""
    r = client.get("/api/accidents/map-points")
    assert r.status_code == 200
    points = r.json()
    assert points, "map-points должен вернуть хоть одну точку"
    for p in points:
        assert p["driver_name"] is None
        assert p["car_reg_number"] is None


def test_by_type(client, user_headers, seeded):
    rows = {row["type"]: row["count"] for row in client.get("/api/stats/by-type", headers=user_headers).json()}
    assert rows["Столкновение"] == 3
    assert rows["Наезд на пешехода"] == 2


def test_by_type_sorted_descending(client, user_headers, seeded):
    counts = [r["count"] for r in client.get("/api/stats/by-type", headers=user_headers).json()]
    assert counts == sorted(counts, reverse=True)


def test_by_cause(client, user_headers, seeded):
    rows = {r["cause"]: r["count"] for r in client.get("/api/stats/by-cause", headers=user_headers).json()}
    assert rows["Превышение скорости"] == 2
    assert rows["Нарушение ПДД"] == 2
    assert rows["Состояние водителя"] == 1


def test_by_day(client, user_headers, seeded):
    rows = {row["day"]: row["count"] for row in client.get("/api/stats/by-day?year=2025&month=6", headers=user_headers).json()}
    assert rows[1] == 2 
    assert rows[5] == 1
    assert rows[10] == 1
    assert rows[15] == 1


def test_by_day_empty_month(client, user_headers, seeded):
    r = client.get("/api/stats/by-day?year=2024&month=1", headers=user_headers)
    assert r.status_code == 200
    assert r.json() == []


def test_by_day_validates_month(client, user_headers):
    r = client.get("/api/stats/by-day?year=2025&month=13", headers=user_headers)
    assert r.status_code == 422


def test_by_location(client, user_headers, seeded):
    rows = {r["location"]: r["total_victims"] for r in client.get("/api/stats/by-location?limit=10", headers=user_headers).json()}
    # ул. Ленина, 1: 2 + 1 + 3 = 6 пострадавших
    assert rows["ул. Ленина, 1"] == 6
    assert rows["пр-т Мира, 10"] == 0
    assert rows["Тверская, 7"] == 1


def test_by_location_respects_limit(client, user_headers, seeded):
    rows = client.get("/api/stats/by-location?limit=2", headers=user_headers).json()
    assert len(rows) == 2


def test_summary(client, user_headers, seeded):
    data = client.get("/api/stats/summary", headers=user_headers).json()
    assert data["total_accidents"] == 5
    assert data["total_victims"] == 7  # 2+1+0+3+1
    assert data["top_type"] == "Столкновение"


def test_summary_empty_db(client, user_headers):
    data = client.get("/api/stats/summary", headers=user_headers).json()
    assert data["total_accidents"] == 0
    assert data["total_victims"] == 0
    assert data["top_type"] is None
    assert data["top_cause"] is None
