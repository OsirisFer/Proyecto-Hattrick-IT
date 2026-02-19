# Modelos = tablas en la base de datos
from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime


from app.db import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)


# Turnos (appointments)
class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Relación con paciente (FK)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)

    # Fecha/hora del turno
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # Estado simple (por ahora string)
    status: Mapped[str] = mapped_column(String, nullable=False, default="scheduled")
