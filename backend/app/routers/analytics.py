from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db
from app.models import Appointment

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    total = db.query(func.count(Appointment.id)).scalar() or 0

    rows = (
        db.query(Appointment.status, func.count(Appointment.id))
        .group_by(Appointment.status)
        .all()
    )
    by_status = {status: count for status, count in rows}

    cancelled = by_status.get("cancelled", 0)
    completed = by_status.get("completed", 0)

    cancel_rate = (cancelled / total) if total else 0.0
    completion_rate = (completed / total) if total else 0.0

    return {
        "total": total,
        "by_status": {
            "scheduled": by_status.get("scheduled", 0),
            "checked_in": by_status.get("checked_in", 0),
            "completed": completed,
            "cancelled": cancelled,
        },
        "cancel_rate": cancel_rate,
        "completion_rate": completion_rate,
    }


@router.get("/by-day")
def by_day(
    days: int = Query(14, ge=1, le=90),
    db: Session = Depends(get_db),
):
    # desde hoy hacia atrás (incluye hoy)
    start_dt = datetime.now() - timedelta(days=days - 1)

    # En SQLite, date() sobre datetime funciona bien
    rows = (
        db.query(
            func.date(Appointment.scheduled_at).label("day"),
            Appointment.status,
            func.count(Appointment.id).label("count"),
        )
        .filter(Appointment.scheduled_at >= start_dt)
        .group_by("day", Appointment.status)
        .order_by("day")
        .all()
    )

    # armamos un dict day -> status -> count
    bucket = {}
    for day_str, status, count in rows:
        bucket.setdefault(day_str, {"scheduled": 0, "checked_in": 0, "completed": 0, "cancelled": 0})
        if status in bucket[day_str]:
            bucket[day_str][status] = count

    # completamos días faltantes con 0
    out = []
    for i in range(days):
        d = (date.today() - timedelta(days=days - 1 - i)).isoformat()
        counts = bucket.get(d, {"scheduled": 0, "checked_in": 0, "completed": 0, "cancelled": 0})
        total = sum(counts.values())
        out.append({"day": d, **counts, "total": total})

    return out
