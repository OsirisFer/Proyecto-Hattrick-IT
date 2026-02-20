from datetime import datetime


def create_patient(client, name="Juan"):
    r = client.post("/patients/", json={"name": name})
    assert r.status_code == 201
    return r.json()


def create_appointment(client, patient_id, when):
    return client.post(
        "/appointments/",
        json={
            "patient_id": patient_id,
            "scheduled_at": when,
        },
    )


def test_create_patient_and_appointment(client):
    patient = create_patient(client)

    when = "2026-02-18T15:00:00"
    r = create_appointment(client, patient["id"], when)

    assert r.status_code == 201
    data = r.json()
    assert data["patient_id"] == patient["id"]
    assert data["status"] == "scheduled"


def test_duplicate_appointment_not_allowed(client):
    patient = create_patient(client)

    when = "2026-02-18T16:00:00"
    r1 = create_appointment(client, patient["id"], when)
    assert r1.status_code == 201

    r2 = create_appointment(client, patient["id"], when)
    assert r2.status_code == 409


def test_invalid_state_transition(client):
    patient = create_patient(client)

    when = "2026-02-18T17:00:00"
    appt = create_appointment(client, patient["id"], when).json()

    # scheduled -> completed (NO permitido)
    r = client.patch(
        f"/appointments/{appt['id']}/status",
        json={"status": "completed"},
    )

    assert r.status_code == 400

def test_valid_state_transition_scheduled_to_checked_in(client):
    patient = create_patient(client)

    when = "2026-02-18T18:00:00"
    appt = create_appointment(client, patient["id"], when).json()

    r = client.patch(
        f"/appointments/{appt['id']}/status",
        json={"status": "checked_in"},
    )

    assert r.status_code == 200
    assert r.json()["status"] == "checked_in"


def test_valid_state_transition_checked_in_to_cancelled(client):
    patient = create_patient(client)

    when = "2026-02-18T19:00:00"
    appt = create_appointment(client, patient["id"], when).json()

    # scheduled -> checked_in
    r1 = client.patch(
        f"/appointments/{appt['id']}/status",
        json={"status": "checked_in"},
    )
    assert r1.status_code == 200

    # checked_in -> cancelled
    r2 = client.patch(
        f"/appointments/{appt['id']}/status",
        json={"status": "cancelled"},
    )
    assert r2.status_code == 200
    assert r2.json()["status"] == "cancelled"
