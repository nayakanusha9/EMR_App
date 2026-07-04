from __future__ import annotations

from datetime import datetime
from datetime import date as DateType
from pydantic import BaseModel, EmailStr, Field


RECEPTIONIST_ROLE = "receptionist"
DOCTOR_ROLE = "doctor"
ALLOWED_ROLES = {RECEPTIONIST_ROLE, DOCTOR_ROLE}


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str = Field(min_length=6)
    role: str = RECEPTIONIST_ROLE


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ReceptionistPatientCreate(BaseModel):
    amax_id: str
    date: DateType
    name: str
    age: int = Field(ge=0)
    phone: str | None = None
    address: str | None = None
    follow_up_1: str | None = None
    follow_up_2: str | None = None


class ReceptionistPatientUpdate(BaseModel):
    amax_id: str | None = None
    date: DateType | None = None
    name: str | None = None
    age: int | None = Field(default=None, ge=0)
    phone: str | None = None
    address: str | None = None
    follow_up_1: str | None = None
    follow_up_2: str | None = None


class DoctorPatientCreate(BaseModel):
    amax_id: str
    date: DateType
    name: str
    age: int = Field(ge=0)
    phone: str | None = None
    address: str | None = None
    follow_up_1: str | None = None
    follow_up_2: str | None = None
    diagnosis: str | None = None
    laterality: str | None = None
    treatment: str | None = None
    status: str | None = None
    finance: str | None = None
    remark_1: str | None = None
    remark_2: str | None = None
    referral: str | None = None


class DoctorPatientUpdate(BaseModel):
    amax_id: str | None = None
    date: DateType | None = None
    name: str | None = None
    age: int | None = Field(default=None, ge=0)
    phone: str | None = None
    address: str | None = None
    follow_up_1: str | None = None
    follow_up_2: str | None = None
    diagnosis: str | None = None
    laterality: str | None = None
    treatment: str | None = None
    status: str | None = None
    finance: str | None = None
    remark_1: str | None = None
    remark_2: str | None = None
    referral: str | None = None


class ReceptionistPatientResponse(BaseModel):
    id: int
    sl_no: int
    amax_id: str
    date: DateType
    name: str
    age: int
    phone: str | None
    address: str | None
    follow_up_1: str | None
    follow_up_2: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DoctorPatientResponse(ReceptionistPatientResponse):
    diagnosis: str | None
    laterality: str | None
    treatment: str | None
    status: str | None
    finance: str | None
    remark_1: str | None
    remark_2: str | None
    referral: str | None


class ReceptionistSearchResult(BaseModel):
    patients: list[ReceptionistPatientResponse]
    total: int


class DoctorSearchResult(BaseModel):
    patients: list[DoctorPatientResponse]
    total: int


class DashboardStats(BaseModel):
    total_patients: int
    registered_today: int
    pending_follow_up_1: int
    pending_follow_up_2: int
    recent_patients: list[ReceptionistPatientResponse]
