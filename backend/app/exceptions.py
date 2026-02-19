class DomainError(Exception):
    pass


class NotFound(DomainError):
    def __init__(self, entity: str, entity_id: int):
        super().__init__(f"{entity} {entity_id} not found")


class AppointmentConflict(DomainError):
    def __init__(self, patient_id: int, scheduled_at: str):
        super().__init__(f"Appointment conflict for patient={patient_id} at {scheduled_at}")


class InvalidStateTransition(DomainError):
    def __init__(self, from_state: str, to_state: str):
        super().__init__(f"Invalid transition: {from_state} -> {to_state}")
