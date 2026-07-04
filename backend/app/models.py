from datetime import datetime, date

from sqlalchemy import String, Integer, DateTime, Date, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="receptionist")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sl_no: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    amax_id: Mapped[str] = mapped_column(String(50), index=True)
    date: Mapped[date] = mapped_column(Date)
    name: Mapped[str] = mapped_column(String(255))
    age: Mapped[int] = mapped_column(Integer)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    follow_up_1: Mapped[str | None] = mapped_column(String(255), nullable=True)
    follow_up_2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    laterality: Mapped[str | None] = mapped_column(String(50), nullable=True)
    treatment: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    finance: Mapped[str | None] = mapped_column(String(255), nullable=True)
    remark_1: Mapped[str | None] = mapped_column(Text, nullable=True)
    remark_2: Mapped[str | None] = mapped_column(Text, nullable=True)
    referral: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
