from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.db import get_db
from app.models import Appointment, Patient

router = APIRouter(prefix="/predict", tags=["prediction"])


def no_show_score(appt: Appointment) -> float:
    """
    Baseline heurístico (0..1).
    Pensado para luego reemplazar por ML real.
    """
    score = 0.2  # base 20%

    # mañana temprano → más no-show
    hour = appt.scheduled_at.hour
    if hour < 9:
        score += 0.2

    # lunes
    if appt.scheduled_at.weekday() == 0:
        score += 0.15

    # turnos cancelados históricamente (simulado)
    # (en ML real: features agregadas por paciente)
    if appt.status == "scheduled":
        score += 0.1

    return min(score, 0.95)


@router.get("/no-show/{appointment_id}")
def predict_no_show(appointment_id: int, db: Session = Depends(get_db)):
    appt = db.query(Appointment).get(appointment_id)
    if not appt:
        return {"detail": "Appointment not found"}

    score = no_show_score(appt)

    return {
        "appointment_id": appt.id,
        "no_show_probability": round(score * 100, 1),
        "model": "heuristic-baseline-v1",
        "explanation": [
            "morning_slot" if appt.scheduled_at.hour < 9 else None,
            "monday" if appt.scheduled_at.weekday() == 0 else None,
            "scheduled_state" if appt.status == "scheduled" else None,
        ],
    }
