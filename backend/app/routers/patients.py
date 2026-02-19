from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.repositories import list_patients as repo_list_patients, create_patient as repo_create_patient
from app.schemas import PatientCreate, PatientOut

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/", response_model=list[PatientOut])
def list_patients(db: Session = Depends(get_db)):
    patients = repo_list_patients(db)
    return [{"id": p.id, "name": p.name} for p in patients]


@router.post("/", response_model=PatientOut, status_code=201)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    p = repo_create_patient(db, payload.name)
    return {"id": p.id, "name": p.name}
