from sqlalchemy import Column, Integer, String, Date, ForeignKey

from ..db import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    experience = Column(Integer, nullable=False, default=0)
    car_reg_number = Column(String(32), ForeignKey("cars.reg_number"), nullable=True)
    license_number = Column(String(64), unique=True, nullable=False)
    license_date = Column(Date, nullable=False)
    # Связь с конкретным актом ДТП появится позже как ForeignKey;
    # пока храним как обычное строковое поле.
    act_number = Column(String(64), nullable=True)
