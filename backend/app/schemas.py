from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict


AppointmentStatus = Literal["scheduled", "checked_in", "completed", "cancelled"]


class PatientCreate(BaseModel):
    name: str


class PatientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


# -------- Appointments --------

class AppointmentCreate(BaseModel):
    patient_id: int
    scheduled_at: datetime


class AppointmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    scheduled_at: datetime
    status: AppointmentStatus


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus
