import { useEffect, useMemo, useState } from "react";
import { api } from "./api/client";
import "./App.css";

function formatLocal(dtIso) {
  return dtIso.replace("T", " ").slice(0, 16);
}

const STATUS_STYLES = {
  scheduled: {
    label: "Scheduled",
    bg: "#fff3cd",
    color: "#856404",
  },
  checked_in: {
    label: "Checked-in",
    bg: "#cce5ff",
    color: "#004085",
  },
  completed: {
    label: "Completed",
    bg: "#d4edda",
    color: "#155724",
  },
  cancelled: {
    label: "Cancelled",
    bg: "#f8d7da",
    color: "#721c24",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || {
    label: status,
    bg: "#eee",
    color: "#333",
  };

  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}



export default function App() {
  const [tab, setTab] = useState("appointments"); // "appointments" | "patients" | "dashboard"

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState({});


  // dashboard
  const [summary, setSummary] = useState(null);
  const [byDay, setByDay] = useState([]);
  const [days, setDays] = useState(14);

  // forms
  const [patientName, setPatientName] = useState("");
  const [apptPatientId, setApptPatientId] = useState("");
  const [apptWhen, setApptWhen] = useState("");

  const patientById = useMemo(() => {
    const map = new Map();
    patients.forEach((p) => map.set(p.id, p));
    return map;
  }, [patients]);

  async function refreshAll() {
    setError("");
    setLoading(true);
    try {
      const [p, a] = await Promise.all([api.listPatients(), api.listAppointments()]);
      setPatients(p);
      setAppointments(a);
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function refreshAnalytics(d = days) {
    setError("");
    setLoading(true);
    try {
      const [s, bd] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getAnalyticsByDay(d),
      ]);
      setSummary(s);
      setByDay(bd);
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    refreshAnalytics(14);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreatePatient(e) {
    e.preventDefault();
    setError("");
    if (!patientName.trim()) return;

    setLoading(true);
    try {
      await api.createPatient(patientName.trim());
      setPatientName("");
      await refreshAll();
      await refreshAnalytics(days);
      setTab("patients");
    } catch (e2) {
      setError(e2?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function onCreateAppointment(e) {
    e.preventDefault();
    setError("");
    if (!apptPatientId || !apptWhen) return;

    const scheduled_at = `${apptWhen}:00`; // datetime-local -> "YYYY-MM-DDTHH:mm"

    setLoading(true);
    try {
      await api.createAppointment(Number(apptPatientId), scheduled_at);
      setApptPatientId("");
      setApptWhen("");
      await refreshAll();
      await refreshAnalytics(days);
      setTab("appointments");
    } catch (e2) {
      setError(e2?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id, status) {
    setError("");
    setLoading(true);
    try {
      await api.updateAppointmentStatus(id, status);
      await refreshAll();
      await refreshAnalytics(days);
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  function NoShowBadge({ value }) {
  const color =
    value >= 60 ? "#721c24" :
    value >= 40 ? "#856404" :
    "#155724";

  const bg =
    value >= 60 ? "#f8d7da" :
    value >= 40 ? "#fff3cd" :
    "#d4edda";

  return (
    <span
      style={{
        background: bg,
        color,
        padding: "4px 8px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      No-show {value}%
    </span>
  );
}


  function MiniBars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.total || 0));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 70,
        padding: "10px 8px",
        border: "1px solid #eee",
        borderRadius: 12,
        background: "#fafafa",
        overflowX: "auto",
      }}
      title="Total appointments per day"
    >
      {data.map((d) => {
        const h = Math.round(((d.total || 0) / max) * 60); // 0..60 px
        return (
          <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              title={`${d.day} • total: ${d.total}`}
              style={{
                width: 12,
                height: Math.max(2, h),
                borderRadius: 6,
                background: "#111",
                opacity: 0.85,
              }}
            />
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>
              {d.day.slice(5)} {/* MM-DD */}
            </div>
          </div>
        );
      })}
    </div>
  );
}


  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 6 }}>Clinic Queue</h1>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>Patients + Appointments workflow</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setTab("appointments")} disabled={tab === "appointments"}>
          Appointments
        </button>
        <button onClick={() => setTab("patients")} disabled={tab === "patients"}>
          Patients
        </button>
        <button onClick={() => setTab("dashboard")} disabled={tab === "dashboard"}>
          Dashboard
        </button>

        <button
          onClick={async () => {
            await refreshAll();
            await refreshAnalytics(days);
          }}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: "#ffe6e6", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <b>Error:</b> {error}
        </div>
      )}

      {tab === "patients" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2 style={{ marginTop: 0 }}>Create patient</h2>
            <form onSubmit={onCreatePatient} style={{ display: "flex", gap: 8 }}>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Name"
                style={{ flex: 1 }}
              />
              <button type="submit" disabled={loading}>
                Create
              </button>
            </form>
          </section>

          <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2 style={{ marginTop: 0 }}>Patients</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {patients.map((p) => (
                <li key={p.id}>
                  <b>#{p.id}</b> — {p.name}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === "appointments" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2 style={{ marginTop: 0 }}>Create appointment</h2>
            <form onSubmit={onCreateAppointment} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select value={apptPatientId} onChange={(e) => setApptPatientId(e.target.value)}>
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} — {p.name}
                  </option>
                ))}
              </select>

              <input type="datetime-local" value={apptWhen} onChange={(e) => setApptWhen(e.target.value)} />

              <button type="submit" disabled={loading}>
                Create
              </button>
            </form>
            <div style={{ marginTop: 8, opacity: 0.75 }}>
              Tip: el backend bloquea duplicados (mismo paciente + mismo horario).
            </div>
          </section>

          <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2 style={{ marginTop: 0 }}>Appointments</h2>

            <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>#{a.id}</td>
                    <td>
                      #{a.patient_id} — {patientById.get(a.patient_id)?.name ?? "Unknown"}
                    </td>
                    <td>{formatLocal(a.scheduled_at)}</td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                    <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        disabled={loading || a.status !== "scheduled"}
                        onClick={() => changeStatus(a.id, "checked_in")}
                      >
                        Check-in
                      </button>

                      <button
                        disabled={loading || a.status !== "checked_in"}
                        onClick={() => changeStatus(a.id, "completed")}
                      >
                        Complete
                      </button>

                      <button
                        disabled={loading || (a.status !== "scheduled" && a.status !== "checked_in")}
                        onClick={() => changeStatus(a.id, "cancelled")}
                      >
                        Cancel
                      </button>

                      <button
                          disabled={loading}
                          onClick={async () => {
                            try {
                              const res = await api.getNoShowPrediction(a.id);
                              setPrediction((p) => ({
                                ...p,
                                [a.id]: res.no_show_probability,
                              }));
                            } catch (e) {
                              setError(e?.message || "Prediction error");
                            }
                          }}
                        >
                          Predict
                        </button>

                        {prediction[a.id] != null && (
                          <NoShowBadge value={prediction[a.id]} />
                        )}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!appointments.length && <div style={{ opacity: 0.7 }}>No appointments yet.</div>}
          </section>
        </div>
      )}

      {tab === "dashboard" && (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ margin: 0 }}>Dashboard</h2>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ opacity: 0.8 }}>Days</label>
                <select
                  value={days}
                  onChange={(e) => {
                    const d = Number(e.target.value);
                    setDays(d);
                    refreshAnalytics(d);
                  }}
                >
                  <option value={7}>7</option>
                  <option value={14}>14</option>
                  <option value={30}>30</option>
                </select>

                <button onClick={() => refreshAnalytics(days)} disabled={loading}>
                  Refresh analytics
                </button>
              </div>
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {(() => {
              const total = summary?.total ?? 0;
              const bs = summary?.by_status ?? {};
              const cancelRate = summary ? Math.round(summary.cancel_rate * 100) : 0;
              const completionRate = summary ? Math.round(summary.completion_rate * 100) : 0;

              const cards = [
                { title: "Total appointments", value: total },
                { title: "Scheduled", value: bs.scheduled ?? 0 },
                { title: "Cancelled", value: bs.cancelled ?? 0, sub: `${cancelRate}% cancel rate` },
                { title: "Completed", value: bs.completed ?? 0, sub: `${completionRate}% completion rate` },
              ];

              return cards.map((c) => (
                <div key={c.title} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
                  <div style={{ opacity: 0.7, marginBottom: 6 }}>{c.title}</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{c.value}</div>
                  {c.sub && <div style={{ opacity: 0.75, marginTop: 4 }}>{c.sub}</div>}
                </div>
              ));
            })()}
          </section>

          <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>Appointments by day</h3>
              {byDay.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <MiniBars data={byDay} />
                </div>
              )}


            <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  <th>Day</th>
                  <th>Total</th>
                  <th>Scheduled</th>
                  <th>Checked-in</th>
                  <th>Completed</th>
                  <th>Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {byDay.map((d) => (
                  <tr key={d.day} style={{ borderBottom: "1px solid #eee" }}>
                    <td>{d.day}</td>
                    <td>
                      <b>{d.total}</b>
                    </td>
                    <td>{d.scheduled}</td>
                    <td>{d.checked_in}</td>
                    <td>{d.completed}</td>
                    <td>{d.cancelled}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!byDay.length && <div style={{ opacity: 0.7 }}>No data yet.</div>}
          </section>
        </div>
      )}
    </div>
  );
}
