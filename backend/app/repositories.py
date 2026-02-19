from datetime import datetime
from sqlalchemy.orm import Session

from app.models import Patient, Appointment


def list_patients(db: Session) -> list[Patient]:
    return db.query(Patient).order_by(Patient.id).all()


def create_patient(db: Session, name: str) -> Patient:
    patient = Patient(name=name)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


# -------- Appointments --------

def create_appointment(db: Session, patient_id: int, scheduled_at: datetime) -> Appointment:
    appt = Appointment(patient_id=patient_id, scheduled_at=scheduled_at, status="scheduled")
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


def list_appointments(db: Session) -> list[Appointment]:
    return db.query(Appointment).order_by(Appointment.scheduled_at.asc()).all()

def get_patient_by_id(db: Session, patient_id: int) -> Patient | None:
    return db.query(Patient).filter(Patient.id == patient_id).first()


def get_appointment_by_id(db: Session, appointment_id: int) -> Appointment | None:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()


def appointment_exists_for_patient_at(db: Session, patient_id: int, scheduled_at: datetime) -> bool:
    return (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient_id)
        .filter(Appointment.scheduled_at == scheduled_at)
        .first()
        is not None
    )
