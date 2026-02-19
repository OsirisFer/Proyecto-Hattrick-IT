from datetime import datetime
from pydantic import BaseModel


class PatientCreate(BaseModel):
    name: str


class PatientOut(BaseModel):
    id: int
    name: str


# -------- Appointments --------

# Lo que el cliente manda para crear un turno
class AppointmentCreate(BaseModel):
    patient_id: int
    scheduled_at: datetime  # ISO string: "2026-02-18T15:00:00"


# Lo que la API devuelve
class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    scheduled_at: datetime
    status: str

class AppointmentStatusUpdate(BaseModel):
    status: str  # "checked_in" | "completed" | "cancelled"
