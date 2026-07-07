from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Patient, User, Visit
from app.schemas import (
    DOCTOR_ROLE,
    RECEPTIONIST_ROLE,
    VisitCreate,
    VisitResponse,
    VisitUpdate,
)
from app.utils import generate_visit_number

router = APIRouter(prefix="/patients/{patient_id}/visits", tags=["Visits"])


def _get_patient(db: Session, patient_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.get("", response_model=list[VisitResponse])
def list_visits(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.role not in {RECEPTIONIST_ROLE, DOCTOR_ROLE}:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    _get_patient(db, patient_id)
    visits = (
        db.query(Visit)
        .filter(Visit.patient_id == patient_id)
        .order_by(Visit.visit_number.asc())
        .all()
    )
    return visits


@router.post("", response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
def create_visit(
    patient_id: int,
    data: VisitCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.role not in {DOCTOR_ROLE, RECEPTIONIST_ROLE}:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    patient = _get_patient(db, patient_id)
    visit_number = generate_visit_number(db, patient_id)
    visit_date = data.visit_date or date.today()
    visit_time = data.visit_time or datetime.now().strftime("%H:%M")

    visit = Visit(
        patient_id=patient_id,
        visit_number=visit_number,
        visit_date=visit_date,
        visit_time=visit_time,
        diagnosis=data.diagnosis,
        prescription=data.prescription,
        notes=data.notes,
        follow_up_remarks=data.follow_up_remarks,
    )
    db.add(visit)

    if data.diagnosis:
        patient.diagnosis = data.diagnosis
    if data.prescription:
        patient.treatment = data.prescription

    db.commit()
    db.refresh(visit)
    return visit


@router.get("/{visit_id}", response_model=VisitResponse)
def get_visit(
    patient_id: int,
    visit_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.role not in {RECEPTIONIST_ROLE, DOCTOR_ROLE}:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    visit = (
        db.query(Visit)
        .filter(Visit.id == visit_id, Visit.patient_id == patient_id)
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit


@router.put("/{visit_id}", response_model=VisitResponse)
def update_visit(
    patient_id: int,
    visit_id: int,
    data: VisitUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.role not in {DOCTOR_ROLE, RECEPTIONIST_ROLE}:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    visit = (
        db.query(Visit)
        .filter(Visit.id == visit_id, Visit.patient_id == patient_id)
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(visit, key, value)

    db.commit()
    db.refresh(visit)
    return visit
