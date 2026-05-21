"""initial schema: cars, drivers, accidents, accident_cars

Revision ID: 0001
Revises:
Create Date: 2026-02-15 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cars",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("brand_company", sa.String(length=128), nullable=False),
        sa.Column("brand_model", sa.String(length=128), nullable=False),
        sa.Column("body_type", sa.String(length=64), nullable=False),
        sa.Column("reg_number", sa.String(length=32), nullable=False),
        sa.UniqueConstraint("reg_number", name="uq_cars_reg_number"),
    )
    op.create_index("ix_cars_reg_number", "cars", ["reg_number"])

    op.create_table(
        "drivers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("experience", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("car_reg_number", sa.String(length=32), nullable=True),
        sa.Column("license_number", sa.String(length=64), nullable=False),
        sa.Column("license_date", sa.Date(), nullable=False),
        sa.Column("act_number", sa.String(length=64), nullable=True),
        sa.UniqueConstraint("license_number", name="uq_drivers_license_number"),
        sa.ForeignKeyConstraint(
            ["car_reg_number"], ["cars.reg_number"],
            name="fk_drivers_car_reg_number",
        ),
    )

    op.create_table(
        "accidents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("department_name", sa.String(length=255), nullable=False),
        sa.Column("act_number", sa.String(length=64), nullable=False),
        sa.Column("driver_id", sa.Integer(), nullable=False),
        sa.Column("car_reg_number", sa.String(length=32), nullable=True),
        sa.Column("accident_date", sa.Date(), nullable=False),
        sa.Column("location", sa.String(length=512), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("victims_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("accident_type", sa.String(length=64), nullable=False),
        sa.Column("accident_cause", sa.String(length=128), nullable=False),
        sa.UniqueConstraint("act_number", name="uq_accidents_act_number"),
        sa.ForeignKeyConstraint(["driver_id"], ["drivers.id"], name="fk_accidents_driver_id"),
        sa.ForeignKeyConstraint(
            ["car_reg_number"], ["cars.reg_number"],
            name="fk_accidents_car_reg_number",
        ),
    )
    op.create_index("ix_accidents_act_number", "accidents", ["act_number"])
    op.create_index("ix_accidents_accident_date", "accidents", ["accident_date"])

    op.create_table(
        "accident_cars",
        sa.Column("accident_id", sa.Integer(), nullable=False),
        sa.Column("car_reg_number", sa.String(length=32), nullable=False),
        sa.PrimaryKeyConstraint("accident_id", "car_reg_number"),
        sa.ForeignKeyConstraint(
            ["accident_id"], ["accidents.id"],
            ondelete="CASCADE",
            name="fk_accident_cars_accident_id",
        ),
        sa.ForeignKeyConstraint(
            ["car_reg_number"], ["cars.reg_number"],
            name="fk_accident_cars_car_reg_number",
        ),
    )


def downgrade() -> None:
    op.drop_table("accident_cars")
    op.drop_index("ix_accidents_accident_date", table_name="accidents")
    op.drop_index("ix_accidents_act_number", table_name="accidents")
    op.drop_table("accidents")
    op.drop_table("drivers")
    op.drop_index("ix_cars_reg_number", table_name="cars")
    op.drop_table("cars")
