from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import AppointmentCreate, AppointmentOut, AppointmentStatusUpdate
from app.repositories import list_appointments
from app import services
from app.exceptions import NotFound, AppointmentConflict, InvalidStateTransition


router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("/", response_model=list[AppointmentOut])
def get_appointments(db: Session = Depends(get_db)):
    appts = list_appointments(db)
    return [
        {
            "id": a.id,
            "patient_id": a.patient_id,
            "scheduled_at": a.scheduled_at,
            "status": a.status,
        }
        for a in appts
    ]


@router.post("/", response_model=AppointmentOut, status_code=201)
def post_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    try:
        a = services.create_appointment(db, payload.patient_id, payload.scheduled_at)
        return {
            "id": a.id,
            "patient_id": a.patient_id,
            "scheduled_at": a.scheduled_at,
            "status": a.status,
        }
    except NotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except AppointmentConflict as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.patch("/{appointment_id}/status", response_model=AppointmentOut)
def patch_appointment_status(appointment_id: int, payload: AppointmentStatusUpdate, db: Session = Depends(get_db)):
    try:
        a = services.update_appointment_status(db, appointment_id, payload.status)
        return {
            "id": a.id,
            "patient_id": a.patient_id,
            "scheduled_at": a.scheduled_at,
            "status": a.status,
        }
    except NotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidStateTransition as e:
        raise HTTPException(status_code=400, detail=str(e))
