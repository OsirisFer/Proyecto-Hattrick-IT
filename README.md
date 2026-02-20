# Clinic Queue – Health Workflow Demo

Mini sistema de gestión de pacientes y turnos, orientado al dominio health/workflow, con backend en FastAPI (Python) y frontend en React.

El objetivo del proyecto es demostrar:
- arquitectura limpia
- reglas de negocio reales
- workflow de estados
- analytics básicos
- integración frontend ↔ backend

---

## 🧠 Concepto

El sistema permite:
- crear pacientes
- crear turnos asociados a pacientes
- gestionar el ciclo de vida del turno mediante un workflow controlado
- visualizar métricas y analytics en un dashboard

No es un CRUD simple: incorpora validaciones, estados y métricas, simulando un sistema real.

---

## 🏗️ Arquitectura

### Backend (FastAPI)

Arquitectura por capas:

app/
├─ routers/ # Endpoints HTTP
├─ services/ # Lógica de negocio (workflow, validaciones)
├─ repositories/ # Acceso a datos (SQLAlchemy)
├─ models.py # Modelos ORM
├─ schemas.py # Contratos de entrada/salida (Pydantic)
├─ exceptions.py # Errores de dominio
└─ db.py # Configuración de base de datos


Transiciones inválidas son rechazadas por el backend.

---

## 📊 Analytics

El sistema expone métricas básicas:
- total de turnos
- turnos por estado
- tasa de cancelación
- tasa de completados
- turnos por día (últimos N días)

El frontend muestra:
- cards resumen
- mini gráfico de barras (CSS)
- tabla por día

---

## 🧪 Testing

- Tests con pytest
- Cobertura de:
  - creación de pacientes
  - creación de turnos
  - bloqueo de duplicados
  - validación de transiciones inválidas

---

## 🚀 Cómo correr el proyecto

### Backend

```bash
cd backend
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload


API disponible en:

http://127.0.0.1:8000

Swagger: http://127.0.0.1:8000/docs

Frontend
cd frontend/proyecto-hattrickit
npm install
npm run dev


Frontend disponible en:

http://localhost:5173

Configurar variable de entorno:

VITE_API_BASE_URL=http://127.0.0.1:8000
