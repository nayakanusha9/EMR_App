from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Patient, Visit


def generate_sl_no(db: Session) -> int:
    max_sl = db.query(func.max(Patient.sl_no)).scalar()
    return (max_sl or 0) + 1


def generate_visit_number(db: Session, patient_id: int) -> int:
    max_num = (
        db.query(func.max(Visit.visit_number))
        .filter(Visit.patient_id == patient_id)
        .scalar()
    )
    return (max_num or 0) + 1


def search_patients(
    db: Session,
    query: str | None = None,
    skip: int = 0,
    limit: int = 50,
    sort_by: str = "sl_no",
    sort_order: str = "asc",
) -> tuple[list[Patient], int]:
    from sqlalchemy import or_, asc, desc

    q = db.query(Patient)

    if query:
        term = f"%{query.strip()}%"
        q = q.filter(
            or_(
                Patient.name.ilike(term),
                Patient.amax_id.ilike(term),
                Patient.phone.ilike(term),
                Patient.address.ilike(term),
                Patient.email.ilike(term),
                Patient.diagnosis.ilike(term),
            )
        )

    sort_columns = {
        "sl_no": Patient.sl_no,
        "amax_id": Patient.amax_id,
        "date": Patient.date,
        "name": Patient.name,
        "age": Patient.age,
        "phone": Patient.phone,
        "created_at": Patient.created_at,
    }
    column = sort_columns.get(sort_by, Patient.sl_no)
    order_fn = desc if sort_order.lower() == "desc" else asc
    q = q.order_by(order_fn(column))

    total = q.count()
    patients = q.offset(skip).limit(limit).all()
    return patients, total


def count_registered_today(db: Session) -> int:
    today = date.today()
    return db.query(Patient).filter(Patient.date == today).count()
