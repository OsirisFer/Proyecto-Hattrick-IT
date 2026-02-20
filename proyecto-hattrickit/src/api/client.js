const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const body = await res.json();
      detail = body?.detail || JSON.stringify(body);
    } catch {}
    throw new Error(`${res.status} - ${detail}`);
  }

  return res.json();
}

export const api = {
  listPatients: () => request("/patients/"),
  createPatient: (name) =>
    request("/patients/", { method: "POST", body: JSON.stringify({ name }) }),

  listAppointments: () => request("/appointments/"),
  createAppointment: (patient_id, scheduled_at) =>
    request("/appointments/", {
      method: "POST",
      body: JSON.stringify({ patient_id, scheduled_at }),
    }),
  updateAppointmentStatus: (id, status) =>
    request(`/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

      // analytics
  getAnalyticsSummary: () => request("/analytics/summary"),
  getAnalyticsByDay: (days = 14) =>
    request(`/analytics/by-day?days=${days}`),

};
