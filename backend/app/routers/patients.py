from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Patient, User
from app.schemas import (
    DOCTOR_ROLE,
    RECEPTIONIST_ROLE,
    DoctorPatientCreate,
    DoctorPatientResponse,
    DoctorPatientUpdate,
    DoctorSearchResult,
    ReceptionistPatientCreate,
    ReceptionistPatientResponse,
    ReceptionistPatientUpdate,
    ReceptionistSearchResult,
)
from app.utils import generate_sl_no, search_patients

router = APIRouter(prefix="/patients", tags=["Patients"])


def _require_role(user: User, *roles: str) -> None:
    if user.role not in roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")


def _to_receptionist(patient: Patient) -> ReceptionistPatientResponse:
    return ReceptionistPatientResponse.model_validate(patient)


def _to_doctor(patient: Patient) -> DoctorPatientResponse:
    return DoctorPatientResponse.model_validate(patient)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_patient(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    data: dict = Body(...),
):
    _require_role(current_user, RECEPTIONIST_ROLE, DOCTOR_ROLE)

    if current_user.role == RECEPTIONIST_ROLE:
        payload = ReceptionistPatientCreate(**data).model_dump()
    else:
        payload = DoctorPatientCreate(**data).model_dump()

    patient = Patient(sl_no=generate_sl_no(db), **payload)
    db.add(patient)
    db.commit()
    db.refresh(patient)

    if current_user.role == DOCTOR_ROLE:
        return _to_doctor(patient)
    return _to_receptionist(patient)


@router.get("")
def list_patients(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    q: str | None = Query(None, description="Search by name, AMAX ID, phone, or address"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    sort_by: str = Query("sl_no"),
    sort_order: str = Query("asc"),
):
    _require_role(current_user, RECEPTIONIST_ROLE, DOCTOR_ROLE)

    patients, total = search_patients(db, q, skip, limit, sort_by, sort_order)

    if current_user.role == DOCTOR_ROLE:
        return DoctorSearchResult(
            patients=[_to_doctor(p) for p in patients],
            total=total,
        )
    return ReceptionistSearchResult(
        patients=[_to_receptionist(p) for p in patients],
        total=total,
    )


@router.get("/{patient_id}")
def get_patient(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    _require_role(current_user, RECEPTIONIST_ROLE, DOCTOR_ROLE)

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if current_user.role == DOCTOR_ROLE:
        return _to_doctor(patient)
    return _to_receptionist(patient)


@router.put("/{patient_id}")
def update_patient(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    data: dict = Body(...),
):
    _require_role(current_user, RECEPTIONIST_ROLE, DOCTOR_ROLE)

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if current_user.role == RECEPTIONIST_ROLE:
        updates = ReceptionistPatientUpdate(**data).model_dump(exclude_unset=True)
    else:
        updates = DoctorPatientUpdate(**data).model_dump(exclude_unset=True)

    for key, value in updates.items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)

    if current_user.role == DOCTOR_ROLE:
        return _to_doctor(patient)
    return _to_receptionist(patient)


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    _require_role(current_user, RECEPTIONIST_ROLE, DOCTOR_ROLE)

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
