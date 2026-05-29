"""Заполняет БД начальными данными.

Запуск: python -m backend.seed
Перед запуском должны быть применены миграции: alembic upgrade head

Создаётся:
  - 2 пользователя (admin / user)
  - 30 автомобилей
  - 40 водителей
  - 300 актов ДТП с реалистичным распределением:
    * 5 водителей-«нарушителей» (по 15-25 ДТП каждый — для отчёта 1)
    * 3+ водителя с большим числом наездов на пешехода (для отчёта 5)
    * Даты разбросаны по 2024-2025
    * 20 различных адресов Москвы
"""
from datetime import date, timedelta
import random

from .db import SessionLocal
from .dependencies.auth import hash_password
from .models.user import User, UserRole
from .models.car import Car
from .models.driver import Driver
from .models.accident import Accident
from .models.accident_car import AccidentCar


# Данные для генерации — 30 машин, 40 водителей, 20 адресов, 7 видов ДТП, 7 причин

CAR_DATA = [
    ("Lada", "Vesta", "седан", "А001АА777"),
    ("Lada", "Granta", "седан", "В002ВВ777"),
    ("Lada", "Largus", "универсал", "С003СС777"),
    ("Lada", "Niva", "внедорожник", "Е004ЕЕ777"),
    ("Toyota", "Camry", "седан", "К005КК777"),
    ("Toyota", "RAV4", "внедорожник", "М006ММ777"),
    ("Toyota", "Corolla", "седан", "Н007НН777"),
    ("Toyota", "Land Cruiser", "внедорожник", "О008ОО777"),
    ("Volkswagen", "Polo", "седан", "Р009РР777"),
    ("Volkswagen", "Tiguan", "внедорожник", "Т010ТТ777"),
    ("Volkswagen", "Passat", "седан", "У011УУ777"),
    ("BMW", "X5", "внедорожник", "Х012ХХ777"),
    ("BMW", "320i", "седан", "А013АА777"),
    ("BMW", "X3", "внедорожник", "В014ВВ777"),
    ("Mercedes-Benz", "E-Class", "седан", "С015СС777"),
    ("Mercedes-Benz", "GLE", "внедорожник", "Е016ЕЕ777"),
    ("Hyundai", "Solaris", "седан", "К017КК777"),
    ("Hyundai", "Tucson", "кроссовер", "М018ММ777"),
    ("Hyundai", "Creta", "кроссовер", "Н019НН777"),
    ("KIA", "Rio", "седан", "О020ОО777"),
    ("KIA", "Sportage", "внедорожник", "Р021РР777"),
    ("KIA", "K5", "седан", "Т022ТТ777"),
    ("Renault", "Logan", "седан", "У023УУ777"),
    ("Renault", "Duster", "внедорожник", "Х024ХХ777"),
    ("Skoda", "Octavia", "хэтчбек", "А025АА777"),
    ("Skoda", "Kodiaq", "внедорожник", "В026ВВ777"),
    ("Ford", "Focus", "хэтчбек", "С027СС777"),
    ("Ford", "Kuga", "кроссовер", "Е028ЕЕ777"),
    ("Nissan", "Qashqai", "кроссовер", "К029КК777"),
    ("Nissan", "X-Trail", "внедорожник", "М030ММ777"),
]

DRIVER_NAMES = [
    "Иванов Иван Иванович", "Петров Пётр Петрович", "Сидоров Сидор Сидорович",
    "Кузнецов Алексей Михайлович", "Смирнов Дмитрий Викторович", "Васильев Николай Сергеевич",
    "Попов Олег Андреевич", "Соколов Артём Павлович", "Михайлов Игорь Романович",
    "Новиков Юрий Александрович", "Фёдоров Константин Олегович", "Морозов Максим Денисович",
    "Волков Сергей Игоревич", "Алексеев Владимир Петрович", "Лебедев Анатолий Викторович",
    "Семёнов Денис Юрьевич", "Егоров Михаил Андреевич", "Павлов Андрей Викторович",
    "Козлов Виктор Сергеевич", "Степанов Тимур Эльдарович", "Николаев Артур Львович",
    "Орлов Григорий Иванович", "Андреев Илья Романович", "Макаров Роман Дмитриевич",
    "Никитин Евгений Александрович", "Захаров Кирилл Олегович", "Зайцев Антон Юрьевич",
    "Соловьёв Владислав Игоревич", "Борисов Никита Алексеевич", "Яковлев Глеб Сергеевич",
    "Григорьев Леонид Михайлович", "Романов Платон Анатольевич", "Воробьёв Марк Олегович",
    "Сергеев Александр Викторович", "Кузьмин Богдан Юрьевич", "Фролов Святослав Игоревич",
    "Александров Тарас Романович", "Дмитриев Захар Денисович", "Королёв Ярослав Алексеевич",
    "Гусев Демьян Михайлович",
]

LOCATIONS = [
    ("ул. Ленина, 12", 55.7558, 37.6176),
    ("Тверская ул., 7", 55.7656, 37.6055),
    ("пр-т Мира, 102", 55.8003, 37.6347),
    ("Садовое кольцо, 25", 55.7707, 37.5894),
    ("Кутузовский пр-т, 30", 55.7416, 37.5388),
    ("Ленинградский пр-т, 78", 55.8045, 37.5108),
    ("ул. Арбат, 14", 55.7494, 37.5928),
    ("Варшавское ш., 56", 55.6500, 37.6200),
    ("МКАД, 45 км", 55.7350, 37.8500),
    ("ул. Тверская-Ямская, 1", 55.7777, 37.5908),
    ("Новый Арбат, 21", 55.7530, 37.5856),
    ("Ленинский пр-т, 95", 55.6896, 37.5421),
    ("Дмитровское ш., 34", 55.8513, 37.5598),
    ("Профсоюзная ул., 88", 55.6488, 37.5443),
    ("Большая Якиманка, 24", 55.7340, 37.6080),
    ("Каширское ш., 17", 55.6605, 37.6534),
    ("Ярославское ш., 100", 55.8721, 37.7283),
    ("Шоссе Энтузиастов, 50", 55.7531, 37.7517),
    ("Волгоградский пр-т, 42", 55.7177, 37.7050),
    ("Рублёвское ш., 16", 55.7521, 37.4435),
]

TYPES = [
    "Столкновение", "Наезд на пешехода", "Наезд на препятствие",
    "Опрокидывание", "Съезд с дороги", "Наезд на велосипедиста", "Прочее",
]
CAUSES = [
    "Превышение скорости", "Нарушение ПДД", "Состояние водителя",
    "Неисправность автомобиля", "Плохие дорожные условия",
    "Выезд на полосу встречного движения", "Прочее",
]

# Веса для случайного выбора (более частые причины/виды чаще встречаются)
TYPE_WEIGHTS = [30, 18, 14, 8, 10, 8, 12]
CAUSE_WEIGHTS = [28, 22, 14, 8, 10, 10, 8]

TOTAL_ACCIDENTS = 300


def seed() -> None:
    db = SessionLocal()
    random.seed(42)  # детерминированный результат
    try:
        # USERS
        if not db.query(User).filter(User.username == "admin").first():
            db.add(User(
                username="admin",
                password_hash=hash_password("admin123"),
                role=UserRole.admin,
                is_active=True,
            ))
        if not db.query(User).filter(User.username == "user").first():
            db.add(User(
                username="user",
                password_hash=hash_password("user123"),
                role=UserRole.user,
                is_active=True,
            ))
        db.commit()

        # CARS
        cars: list[Car] = []
        for company, model, body, reg in CAR_DATA:
            car = db.query(Car).filter(Car.reg_number == reg).first()
            if not car:
                car = Car(brand_company=company, brand_model=model, body_type=body, reg_number=reg)
                db.add(car)
            cars.append(car)
        db.commit()
        for c in cars:
            db.refresh(c)

        # DRIVERS
        drivers: list[Driver] = []
        for i, name in enumerate(DRIVER_NAMES):
            license_number = f"77AB{100000 + i}"
            d = db.query(Driver).filter(Driver.license_number == license_number).first()
            if not d:
                d = Driver(
                    full_name=name,
                    experience=random.randint(1, 35),
                    car_reg_number=cars[i % len(cars)].reg_number,
                    license_number=license_number,
                    license_date=date(2005 + (i % 18), 1 + (i % 12), 1 + (i % 28)),
                )
                db.add(d)
            drivers.append(d)
        db.commit()
        for d in drivers:
            db.refresh(d)

        # ACCIDENTS
        existing_count = db.query(Accident).count()
        if existing_count >= TOTAL_ACCIDENTS:
            print(f"Уже есть {existing_count} актов ДТП — пропускаем")
            return

        # Для генерации реалистичного распределения водителей по количеству ДТП задаём веса
        # Нарушители получают много ДТП, случайные — мало или одно
        driver_weights = []
        for i in range(len(drivers)):
            if i < 5:
                driver_weights.append(25)   # топ-5 опасных водителей
            elif i < 12:
                driver_weights.append(8)
            elif i < 25:
                driver_weights.append(3)
            else:
                driver_weights.append(1)

        start_date = date(2024, 1, 1)
        date_range_days = 730

        # Первые N ДТП = по одному на каждого водителя, остальные распределяются случайно по весам
        shuffled_drivers = drivers.copy()
        random.shuffle(shuffled_drivers)
        guaranteed = list(shuffled_drivers[:TOTAL_ACCIDENTS])

        for i in range(TOTAL_ACCIDENTS):
            act_number = f"АКТ-{1000 + i}"
            if db.query(Accident).filter(Accident.act_number == act_number).first():
                continue

            # Гарантируем, что первые 40 ДТП принадлежат разным водителям, чтобы в отчёте 1 было что показать
            if i < len(guaranteed):
                driver = guaranteed[i]
            else:
                driver = random.choices(drivers, weights=driver_weights, k=1)[0]
            loc, lat, lon = random.choice(LOCATIONS)
            car = random.choice(cars)
            extra_car = random.choice(cars)

            accident_date_val = start_date + timedelta(days=random.randint(0, date_range_days))

            # Для первых 3-х водителей слегка повышен шанс «Наезд на пешехода»
            if drivers.index(driver) < 3 and random.random() < 0.35:
                accident_type = "Наезд на пешехода"
            else:
                accident_type = random.choices(TYPES, weights=TYPE_WEIGHTS, k=1)[0]

            accident_cause = random.choices(CAUSES, weights=CAUSE_WEIGHTS, k=1)[0]

            # Жертвы: чаще 0-1, реже 2-3, очень редко 4-6
            victims_count = random.choices(
                [0, 1, 2, 3, 4, 5, 6],
                weights=[35, 30, 18, 9, 4, 2, 2],
                k=1,
            )[0]

            jitter_lat = random.uniform(-0.008, 0.008)
            jitter_lon = random.uniform(-0.008, 0.008)

            acc = Accident(
                department_name=f"Отдел ГИБДД №{1 + (i % 8)}",
                act_number=act_number,
                driver_id=driver.id,
                car_reg_number=car.reg_number,
                accident_date=accident_date_val,
                location=loc,
                latitude=lat + jitter_lat,
                longitude=lon + jitter_lon,
                victims_count=victims_count,
                accident_type=accident_type,
                accident_cause=accident_cause,
            )
            db.add(acc)
            db.flush()

            # Основная машина всегда в M:N
            db.add(AccidentCar(accident_id=acc.id, car_reg_number=car.reg_number))
            # 35% шанс — добавить ещё одну машину-участника (если она другая)
            if extra_car.reg_number != car.reg_number and random.random() < 0.35:
                db.add(AccidentCar(accident_id=acc.id, car_reg_number=extra_car.reg_number))

            # Коммитим каждые 50, чтобы не накапливать слишком много в одной транзакции
            if (i + 1) % 50 == 0:
                db.commit()

        db.commit()

        # Заполняем act_number каждому водителю и берём его последний акт
        for d in drivers:
            last_acc = (
                db.query(Accident)
                .filter(Accident.driver_id == d.id)
                .order_by(Accident.accident_date.desc())
                .first()
            )
            if last_acc:
                d.act_number = last_acc.act_number
        db.commit()

        print(
            f"Seed выполнен: 2 пользователя, {len(cars)} авто, "
            f"{len(drivers)} водителей, {TOTAL_ACCIDENTS} актов ДТП."
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed()
