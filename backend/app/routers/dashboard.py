from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Patient, User
from app.schemas import DashboardStats, ReceptionistPatientResponse
from app.utils import count_registered_today

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
):
    total_patients = db.query(Patient).count()
    registered_today = count_registered_today(db)
    pending_follow_up_1 = (
        db.query(Patient)
        .filter((Patient.follow_up_1.is_(None)) | (Patient.follow_up_1 == ""))
        .count()
    )
    pending_follow_up_2 = (
        db.query(Patient)
        .filter((Patient.follow_up_2.is_(None)) | (Patient.follow_up_2 == ""))
        .count()
    )
    recent_patients = (
        db.query(Patient).order_by(Patient.created_at.desc()).limit(5).all()
    )

    return DashboardStats(
        total_patients=total_patients,
        registered_today=registered_today,
        pending_follow_up_1=pending_follow_up_1,
        pending_follow_up_2=pending_follow_up_2,
        recent_patients=[
            ReceptionistPatientResponse.model_validate(p) for p in recent_patients
        ],
    )
