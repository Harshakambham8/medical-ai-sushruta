import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function AdminBookingsView() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/admin/bookings");
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      showToast("error", "Failed to load bookings from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage({ type: "", text: "" });
    }, 4000);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(id);
    try {
      const res = await API.put(`/api/admin/bookings/${id}/status`, { status: newStatus });
      if (res.data.success) {
        showToast("success", `✓ Appointment #${id} updated to ${newStatus.toUpperCase()}`);
        fetchBookings();
      }
    } catch (err) {
      showToast("error", `Failed to update appointment: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchesFilter =
      statusFilter === "all" ? true : appt.status === statusFilter;

    const matchesSearch =
      search.trim() === "" ||
      appt.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      appt.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
      appt.specialization.toLowerCase().includes(search.toLowerCase()) ||
      (appt.notes && appt.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fade-in 0.3s ease-out" }}>
      {/* Toast Alert */}
      {toastMessage.text && (
        <div
          style={{
            padding: "12px 20px",
            background:
              toastMessage.type === "success"
                ? "rgba(0, 255, 135, 0.15)"
                : "rgba(255, 0, 64, 0.15)",
            border:
              toastMessage.type === "success"
                ? "1px solid var(--neon-green)"
                : "1px solid var(--neon-red)",
            borderRadius: "var(--radius)",
            color: toastMessage.type === "success" ? "var(--neon-green)" : "var(--neon-red)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage({ type: "", text: "" })}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>📅</span>
            <h1 className="section-title" style={{ margin: 0, fontSize: 22 }}>
              PATIENT BOOKINGS & DOCTOR CONFIRMATIONS DISPATCH
            </h1>
          </div>
          <p className="section-subtitle" style={{ margin: "4px 0 0", fontSize: 13 }}>
            Central clinical appointment dispatch showing patient bookings, physician slot confirmations, and scheduling passes.
          </p>
        </div>

        <button
          className="btn-cyber purple"
          onClick={fetchBookings}
          disabled={loading}
          style={{ fontSize: 11, padding: "10px 18px" }}
        >
          <span>🔄 REFRESH BOOKINGS</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div className="cyber-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            TOTAL BOOKINGS
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--neon-cyan)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {stats.total || appointments.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Total scheduled slots across system
          </div>
        </div>

        <div className="cyber-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "var(--neon-green)", fontFamily: "var(--font-mono)" }}>
            ✓ CONFIRMED BY DOCTORS
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--neon-green)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {stats.confirmed || 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Active consultations ready
          </div>
        </div>

        <div className="cyber-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "#ffaa00", fontFamily: "var(--font-mono)" }}>
            ⏳ PENDING CONFIRMATIONS
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#ffaa00", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {stats.pending || 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Awaiting physician review
          </div>
        </div>

        <div className="cyber-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "var(--neon-red)", fontFamily: "var(--font-mono)" }}>
            ✕ CANCELLED / VOID
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--neon-red)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {stats.cancelled || 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Slots released back to schedule
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="cyber-card"
        style={{
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 260px", maxWidth: 400 }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            type="text"
            className="cyber-input"
            placeholder="Search patient, doctor, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: 12, padding: "8px 12px" }}
          />
        </div>

        {/* Status Tabs */}
        <div className="tab-bar" style={{ margin: 0 }}>
          <button
            className={`tab-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
            style={{ padding: "6px 12px", fontSize: 10 }}
          >
            All Bookings ({appointments.length})
          </button>
          <button
            className={`tab-btn ${statusFilter === "confirmed" ? "active" : ""}`}
            onClick={() => setStatusFilter("confirmed")}
            style={{ padding: "6px 12px", fontSize: 10 }}
          >
            ✓ Confirmed ({stats.confirmed || 0})
          </button>
          <button
            className={`tab-btn ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => setStatusFilter("pending")}
            style={{ padding: "6px 12px", fontSize: 10 }}
          >
            ⏳ Pending ({stats.pending || 0})
          </button>
          <button
            className={`tab-btn ${statusFilter === "cancelled" ? "active" : ""}`}
            onClick={() => setStatusFilter("cancelled")}
            style={{ padding: "6px 12px", fontSize: 10 }}
          >
            ✕ Cancelled ({stats.cancelled || 0})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div className="cyber-spinner" style={{ margin: "0 auto 16px" }}></div>
          <div style={{ color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            Loading Dispatch Telemetry...
          </div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="cyber-card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            No appointments found matching this criteria.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
          {filteredAppointments.map((appt) => {
            const isConfirmed = appt.status === "confirmed";
            const isPending = appt.status === "pending";
            const isCancelled = appt.status === "cancelled";

            return (
              <div
                key={appt.id}
                className="cyber-card"
                style={{
                  border: isConfirmed
                    ? "1px solid var(--neon-cyan)"
                    : isPending
                    ? "1px solid #ffaa00"
                    : "1px solid var(--border-default)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14,
                }}
              >
                {/* Top: Status & Booking ID */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    BOOKING REF: #SCH-{String(appt.id).padStart(5, "0")}
                  </span>
                  <span
                    className={`status-badge ${
                      isConfirmed ? "optimal" : isPending ? "attention" : "attention"
                    }`}
                    style={{
                      background: isCancelled ? "rgba(255, 0, 64, 0.15)" : undefined,
                      color: isCancelled ? "var(--neon-red)" : undefined,
                      borderColor: isCancelled ? "var(--neon-red)" : undefined,
                    }}
                  >
                    {appt.status?.toUpperCase() || "CONFIRMED"}
                  </span>
                </div>

                {/* Patient & Doctor Pair */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: "var(--radius)" }}>
                    <span style={{ fontSize: 9, color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                      👤 PATIENT
                    </span>
                    <strong style={{ fontSize: 13, color: "var(--text-primary)", display: "block" }}>
                      {appt.patient_name}
                    </strong>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{appt.patient_email || "Not recorded"}</div>
                    {appt.patient_phone && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{appt.patient_phone}</div>}
                  </div>

                  <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: "var(--radius)" }}>
                    <span style={{ fontSize: 9, color: "var(--neon-purple)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                      👩‍⚕️ ASSIGNED DOCTOR
                    </span>
                    <strong style={{ fontSize: 13, color: "var(--text-primary)", display: "block" }}>
                      {appt.doctor_name}
                    </strong>
                    <div style={{ fontSize: 11, color: "var(--neon-purple)", fontWeight: 600 }}>{appt.specialization}</div>
                  </div>
                </div>

                {/* Date & Time Slot Box */}
                <div
                  style={{
                    background: "rgba(102, 252, 241, 0.05)",
                    border: "1px solid rgba(102, 252, 241, 0.2)",
                    borderRadius: "var(--radius)",
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🗓️</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{appt.date}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Scheduled Date</div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--neon-cyan)", fontFamily: "var(--font-mono)" }}>
                      ⏰ {appt.time_slot}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Consultation Slot</div>
                  </div>
                </div>

                {/* Patient Reason / Clinical Notes */}
                {appt.notes && (
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-input)", padding: "8px 10px", borderRadius: "4px" }}>
                    <strong style={{ color: "var(--text-primary)" }}>Clinical Reason:</strong> {appt.notes}
                  </div>
                )}

                {/* Admin Status Override Buttons */}
                <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid var(--border-default)" }}>
                  {!isConfirmed && (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, "confirmed")}
                      disabled={actionLoading === appt.id}
                      className="btn-cyber"
                      style={{
                        flex: 1,
                        fontSize: 10,
                        padding: "6px 10px",
                        justifyContent: "center",
                        background: "rgba(0, 255, 135, 0.15)",
                        border: "1px solid var(--neon-green)",
                        color: "var(--neon-green)",
                      }}
                    >
                      <span>✓ CONFIRM</span>
                    </button>
                  )}

                  {!isCancelled && (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, "cancelled")}
                      disabled={actionLoading === appt.id}
                      className="btn-cyber"
                      style={{
                        flex: 1,
                        fontSize: 10,
                        padding: "6px 10px",
                        justifyContent: "center",
                        background: "rgba(255, 0, 64, 0.12)",
                        border: "1px solid var(--neon-red)",
                        color: "var(--neon-red)",
                      }}
                    >
                      <span>✕ CANCEL</span>
                    </button>
                  )}

                  {appt.status !== "completed" && isConfirmed && (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, "completed")}
                      disabled={actionLoading === appt.id}
                      className="btn-cyber purple"
                      style={{
                        flex: 1,
                        fontSize: 10,
                        padding: "6px 10px",
                        justifyContent: "center",
                      }}
                    >
                      <span>✓ MARK DONE</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
