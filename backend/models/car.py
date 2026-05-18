from sqlalchemy import Column, Integer, String

from ..db import Base


class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    brand_company = Column(String(128), nullable=False)
    brand_model = Column(String(128), nullable=False)
    body_type = Column(String(64), nullable=False)
    reg_number = Column(String(32), unique=True, nullable=False, index=True)
