from __future__ import annotations

from datetime import datetime
from datetime import date as DateType
from pydantic import BaseModel, EmailStr, Field


RECEPTIONIST_ROLE = "receptionist"
DOCTOR_ROLE = "doctor"
ALLOWED_ROLES = {RECEPTIONIST_ROLE, DOCTOR_ROLE}

PATIENT_TYPES = [
    "New Consultation",
    "Follow Up",
    "Procedure",
    "Emergency",
    "WhatsApp",
]

APPOINTMENT_STATUSES = [
    "Scheduled",
    "Confirmed",
    "Checked-In",
    "Completed",
    "No-Show",
    "Cancelled",
]


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
    phone: str | None = None
    profile_picture: str | None = None
    is_active: bool

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    profile_picture: str | None = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PatientBaseFields(BaseModel):
    amax_id: str
    date: DateType
    name: str
    age: int = Field(ge=0)
    phone: str | None = None
    phone_country_code: str | None = "+91"
    email: str | None = None
    address: str | None = None
    appointment_time: str | None = None
    patient_type: str | None = None
    appointment_status: str | None = None


class ReceptionistPatientCreate(PatientBaseFields):
    follow_up_1: str | None = None
    follow_up_2: str | None = None


class ReceptionistPatientUpdate(BaseModel):
    amax_id: str | None = None
    date: DateType | None = None
    name: str | None = None
    age: int | None = Field(default=None, ge=0)
    phone: str | None = None
    phone_country_code: str | None = None
    email: str | None = None
    address: str | None = None
    appointment_time: str | None = None
    patient_type: str | None = None
    appointment_status: str | None = None
    follow_up_1: str | None = None
    follow_up_2: str | None = None


class DoctorPatientCreate(PatientBaseFields):
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
    phone_country_code: str | None = None
    email: str | None = None
    address: str | None = None
    appointment_time: str | None = None
    patient_type: str | None = None
    appointment_status: str | None = None
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
    phone_country_code: str | None
    email: str | None
    address: str | None
    appointment_time: str | None
    patient_type: str | None
    appointment_status: str | None
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


class BulkDeleteRequest(BaseModel):
    ids: list[int] = Field(min_length=1)


class VisitCreate(BaseModel):
    diagnosis: str | None = None
    prescription: str | None = None
    notes: str | None = None
    follow_up_remarks: str | None = None
    visit_date: DateType | None = None


class VisitUpdate(BaseModel):
    diagnosis: str | None = None
    prescription: str | None = None
    notes: str | None = None
    follow_up_remarks: str | None = None
    visit_date: DateType | None = None


class VisitResponse(BaseModel):
    id: int
    patient_id: int
    visit_number: int
    visit_date: DateType
    diagnosis: str | None
    prescription: str | None
    notes: str | None
    follow_up_remarks: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_patients: int
    registered_today: int
    pending_follow_up_1: int
    pending_follow_up_2: int
    recent_patients: list[ReceptionistPatientResponse]
