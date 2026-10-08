import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function AdminActivityAuditView() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, doctorActions: 0, patientActions: 0, adminActions: 0 });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'doctor' | 'patient' | 'admin' | 'system'
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/admin/activities", {
        params: {
          role: roleFilter,
          action: actionFilter,
          search: search.trim() || undefined,
        },
      });
      if (res.data.success) {
        setLogs(res.data.logs || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Fetch activities error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [roleFilter, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  const getActionBadgeColor = (actionType) => {
    switch (actionType) {
      case "APPOINTMENT_BOOKED":
      case "REPORT_ANALYZED":
        return "var(--neon-cyan)";
      case "APPOINTMENT_CONFIRMED":
      case "DOCTOR_VERIFIED":
        return "var(--neon-green)";
      case "APPOINTMENT_CANCELLED":
      case "DOCTOR_SUSPENDED":
        return "var(--neon-red)";
      case "SYMPTOM_CONSULTATION":
      case "SLOTS_UPDATED":
        return "var(--neon-purple)";
      default:
        return "var(--text-secondary)";
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case "doctor":
        return "👩‍⚕️";
      case "patient":
        return "👤";
      case "admin":
        return "👑";
      default:
        return "🤖";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fade-in 0.3s ease-out" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <h1 className="section-title" style={{ margin: 0, fontSize: 22 }}>
              DOCTOR & PATIENT ACTIVITY AUDIT STREAM
            </h1>
          </div>
          <p className="section-subtitle" style={{ margin: "4px 0 0", fontSize: 13 }}>
            Real-time telemetry and audit trail documenting clinical interactions, report uploads, scheduling events, and consultations.
          </p>
        </div>

        <button
          className="btn-cyber purple"
          onClick={fetchActivities}
          disabled={loading}
          style={{ fontSize: 11, padding: "10px 18px" }}
        >
          <span>🔄 SYNC AUDIT FEED</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div className="cyber-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            TOTAL AUDITED ACTIONS
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--neon-cyan)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {stats.total || logs.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Captured across all telemetry nodes
          </div>
        </div>

        <div className="cyber-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "var(--neon-purple)", fontFamily: "var(--font-mono)" }}>
            👩‍⚕️ DOCTOR ACTIONS
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--neon-purple)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {stats.doctorActions || 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Confirmations & slot schedules
          </div>
        </div>

        <div className="cyber-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "var(--neon-green)", fontFamily: "var(--font-mono)" }}>
            👤 PATIENT ACTIONS
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--neon-green)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {stats.patientActions || 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Bookings, symptom queries & reports
          </div>
        </div>

        <div className="cyber-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "var(--neon-red)", fontFamily: "var(--font-mono)" }}>
            👑 ADMIN & SYSTEM
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--neon-red)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {stats.adminActions || 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Credentialing & dispatch logs
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
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 260px", maxWidth: 400 }}>
          <input
            type="text"
            className="cyber-input"
            placeholder="Search by actor name, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: 12, padding: "8px 12px" }}
          />
          <button type="submit" className="btn-cyber" style={{ fontSize: 11, padding: "8px 12px" }}>
            <span>FIND</span>
          </button>
        </form>

        {/* Role Tabs */}
        <div className="tab-bar" style={{ margin: 0 }}>
          <button
            className={`tab-btn ${roleFilter === "all" ? "active" : ""}`}
            onClick={() => setRoleFilter("all")}
            style={{ padding: "6px 12px", fontSize: 10 }}
          >
            All Actors
          </button>
          <button
            className={`tab-btn ${roleFilter === "doctor" ? "active" : ""}`}
            onClick={() => setRoleFilter("doctor")}
            style={{ padding: "6px 12px", fontSize: 10 }}
          >
            👩‍⚕️ Doctors
          </button>
          <button
            className={`tab-btn ${roleFilter === "patient" ? "active" : ""}`}
            onClick={() => setRoleFilter("patient")}
            style={{ padding: "6px 12px", fontSize: 10 }}
          >
            👤 Patients
          </button>
          <button
            className={`tab-btn ${roleFilter === "admin" ? "active" : ""}`}
            onClick={() => setRoleFilter("admin")}
            style={{ padding: "6px 12px", fontSize: 10 }}
          >
            👑 Admin
          </button>
        </div>
      </div>

      {/* Audit Log Stream Table / Feed */}
      <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, letterSpacing: 1, color: "var(--text-primary)" }}>
            LIVE ACTION AUDIT TRAIL ({logs.length} EVENTS)
          </div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-green)" }}>
            <span className="pulse-dot"></span> SECURE EVENT LOGGING
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div className="cyber-spinner" style={{ margin: "0 auto 16px" }}></div>
            <div style={{ color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
              Reading System Activity Logs...
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 13 }}>
            No activity logs found for the selected parameters.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {logs.map((item) => {
              const badgeColor = getActionBadgeColor(item.action_type);
              return (
                <div
                  key={item.id}
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border-default)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-input)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "8px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-default)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {getRoleIcon(item.actor_role)}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <strong style={{ color: "var(--text-primary)", fontSize: 13 }}>
                          {item.actor_name}
                        </strong>
                        <span
                          style={{
                            fontSize: 9,
                            fontFamily: "var(--font-mono)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "var(--bg-input)",
                            color: item.actor_role === "doctor" ? "var(--neon-purple)" : item.actor_role === "patient" ? "var(--neon-cyan)" : "var(--neon-red)",
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}
                        >
                          {item.actor_role}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "var(--font-mono)",
                            color: badgeColor,
                            fontWeight: 700,
                            border: `1px solid ${badgeColor}`,
                            padding: "1px 6px",
                            borderRadius: "3px",
                          }}
                        >
                          {item.action_type}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {item.description}
                      </div>

                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "flex", gap: 14, marginTop: 2 }}>
                        <span>IP: {item.ip_address || "127.0.0.1"}</span>
                        {item.actor_email && <span>Email: {item.actor_email}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {formatDate(item.created_at)}
                    </div>
                    <span
                      className={`status-badge ${item.status === "warning" ? "attention" : "optimal"}`}
                      style={{ marginTop: 6, display: "inline-block", fontSize: 9 }}
                    >
                      {item.status?.toUpperCase() || "LOGGED"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
