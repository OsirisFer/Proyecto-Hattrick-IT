from datetime import datetime
from sqlalchemy.orm import Session

from app import repositories
from app.exceptions import NotFound, AppointmentConflict, InvalidStateTransition


APPOINTMENT_STATUSES = {"scheduled", "checked_in", "completed", "cancelled"}

ALLOWED_TRANSITIONS = {
    "scheduled": {"checked_in", "cancelled"},
    "checked_in": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


def create_appointment(db: Session, patient_id: int, scheduled_at: datetime):
    patient = repositories.get_patient_by_id(db, patient_id)
    if not patient:
        raise NotFound("Patient", patient_id)

    if repositories.appointment_exists_for_patient_at(db, patient_id, scheduled_at):
        raise AppointmentConflict(patient_id, str(scheduled_at))

    return repositories.create_appointment(db, patient_id, scheduled_at)


def update_appointment_status(db: Session, appointment_id: int, new_status: str):
    if new_status not in APPOINTMENT_STATUSES:
        raise InvalidStateTransition("unknown", new_status)

    appt = repositories.get_appointment_by_id(db, appointment_id)
    if not appt:
        raise NotFound("Appointment", appointment_id)

    current = appt.status
    if new_status not in ALLOWED_TRANSITIONS.get(current, set()):
        raise InvalidStateTransition(current, new_status)

    appt.status = new_status
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt
