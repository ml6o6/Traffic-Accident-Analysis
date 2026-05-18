from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey

from ..db import Base


class Accident(Base):
    __tablename__ = "accidents"

    id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String(255), nullable=False)
    act_number = Column(String(64), unique=True, nullable=False, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    car_reg_number = Column(String(32), ForeignKey("cars.reg_number"), nullable=True)
    accident_date = Column(Date, nullable=False, index=True)
    location = Column(String(512), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    victims_count = Column(Integer, nullable=False, default=0)
    accident_type = Column(String(64), nullable=False)
    accident_cause = Column(String(128), nullable=False)
