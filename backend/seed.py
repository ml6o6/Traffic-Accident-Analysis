from datetime import date
import random

from .db import SessionLocal
from .models.car import Car
from .models.driver import Driver
from .models.accident import Accident
from .models.accident_car import AccidentCar


CAR_DATA = [
    ("Lada", "Vesta", "седан", "А001АА777"),
    ("Lada", "Granta", "седан", "В002ВВ777"),
    ("Toyota", "Camry", "седан", "С003СС777"),
    ("Toyota", "RAV4", "внедорожник", "Е004ЕЕ777"),
    ("Volkswagen", "Polo", "седан", "К005КК777"),
    ("BMW", "X5", "внедорожник", "Н007НН777"),
    ("Hyundai", "Solaris", "седан", "О008ОО777"),
    ("KIA", "Rio", "седан", "Р009РР777"),
]

DRIVER_NAMES = [
    "Иванов Иван Иванович",
    "Петров Пётр Петрович",
    "Сидоров Сидор Сидорович",
    "Кузнецов Алексей Михайлович",
    "Смирнов Дмитрий Викторович",
    "Васильев Николай Сергеевич",
]

LOCATIONS = [
    ("ул. Ленина, 12", 55.7558, 37.6176),
    ("Тверская ул., 7", 55.7656, 37.6055),
    ("пр-т Мира, 102", 55.8003, 37.6347),
    ("Садовое кольцо, 25", 55.7707, 37.5894),
    ("Кутузовский пр-т, 30", 55.7416, 37.5388),
]

TYPES = [
    "Столкновение", "Наезд на пешехода", "Наезд на препятствие",
    "Опрокидывание", "Съезд с дороги", "Прочее",
]
CAUSES = [
    "Превышение скорости", "Нарушение ПДД", "Состояние водителя",
    "Неисправность автомобиля", "Плохие дорожные условия",
    "Выезд на полосу встречного движения",
]


def seed() -> None:
    db = SessionLocal()
    try:
        # --- CARS ---
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

        # --- DRIVERS ---
        drivers: list[Driver] = []
        for i, name in enumerate(DRIVER_NAMES):
            license_number = f"77AB{100000 + i}"
            d = db.query(Driver).filter(Driver.license_number == license_number).first()
            if not d:
                d = Driver(
                    full_name=name,
                    experience=random.randint(1, 25),
                    car_reg_number=cars[i % len(cars)].reg_number,
                    license_number=license_number,
                    license_date=date(2012 + (i % 8), 1 + (i % 12), 1 + (i % 28)),
                )
                db.add(d)
            drivers.append(d)
        db.commit()
        for d in drivers:
            db.refresh(d)

        # --- ACCIDENTS (15 актов в июне 2025) ---
        existing = db.query(Accident).count()
        if existing >= 15:
            print(f"Уже есть {existing} актов ДТП — пропускаем")
            return

        random.seed(42)
        for i in range(15):
            act_number = f"АКТ-2025-{1000 + i}"
            if db.query(Accident).filter(Accident.act_number == act_number).first():
                continue
            loc, lat, lon = LOCATIONS[i % len(LOCATIONS)]
            driver = drivers[i % len(drivers)]
            car = cars[i % len(cars)]
            extra_car = cars[(i + 3) % len(cars)]

            acc = Accident(
                department_name=f"Отдел ГИБДД №{1 + (i % 3)}",
                act_number=act_number,
                driver_id=driver.id,
                car_reg_number=car.reg_number,
                accident_date=date(2025, 6, 1 + (i % 28)),
                location=loc,
                latitude=lat + random.uniform(-0.01, 0.01),
                longitude=lon + random.uniform(-0.01, 0.01),
                victims_count=random.choice([0, 0, 1, 1, 2, 3]),
                accident_type=random.choice(TYPES),
                accident_cause=random.choice(CAUSES),
            )
            db.add(acc)
            db.flush()

            db.add(AccidentCar(accident_id=acc.id, car_reg_number=car.reg_number))
            if extra_car.reg_number != car.reg_number and random.random() < 0.4:
                db.add(AccidentCar(accident_id=acc.id, car_reg_number=extra_car.reg_number))

        db.commit()
        print("Seed выполнен: автомобили, водители и 15 актов ДТП созданы.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
