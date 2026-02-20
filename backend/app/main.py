from fastapi import FastAPI

from app.db import Base, engine
from app.routers import patients, appointments, analytics

# 1) Creamos la app
app = FastAPI(
    title="Proyecto HattrickIT - Clinic Queue API",
    version="1.0.0"
)

# 2) Creamos las tablas si no existen
Base.metadata.create_all(bind=engine)

# 3) Endpoints simples
@app.get("/health")
def health_check():
    return {"status": "ok"}

# 4) Registramos los routers
app.include_router(patients.router)
app.include_router(appointments.router)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router)

