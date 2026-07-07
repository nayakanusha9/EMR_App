from datetime import datetime, date

from sqlalchemy import String, Integer, DateTime, Date, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="receptionist")
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    profile_picture: Mapped[str | None] = mapped_column(Text, nullable=True)
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
    phone_country_code: Mapped[str | None] = mapped_column(String(10), default="+91", nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    appointment_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    patient_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    appointment_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
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

    visits: Mapped[list["Visit"]] = relationship(
        "Visit", back_populates="patient", cascade="all, delete-orphan", order_by="Visit.visit_number"
    )


class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    visit_number: Mapped[int] = mapped_column(Integer)
    visit_date: Mapped[date] = mapped_column(Date)
    visit_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    prescription: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    follow_up_remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    patient: Mapped["Patient"] = relationship("Patient", back_populates="visits")
