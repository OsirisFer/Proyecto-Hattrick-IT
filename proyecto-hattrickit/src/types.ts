export type AppointmentStatus = "scheduled" | "checked_in" | "completed" | "cancelled";

export type Patient = { id: number; name: string };

export type Appointment = {
  id: number;
  patient_id: number;
  scheduled_at: string; // ISO
  status: AppointmentStatus;
};
