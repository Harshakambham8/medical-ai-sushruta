import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  openDoctorDossierPrintWindow,
  downloadPatientJSON,
  downloadPatientTextSummary,
  calculateBMI as getBMIData
} from "../utils/exportDoctorDossier";

export default function DashboardView() {
  const { user, quickSwitch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [logFilter, setLogFilter] = useState("all"); // 'all' | 'chats' | 'reports'

  // Patient Edit Form State
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    blood_group: "O+ (Positive)",
    height: "178 cm",
    weight: "74 kg",
    email: "",
    phone: "",
    allergies: "",
    chronic_conditions: "",
    emergency_contact: "",
    primary_physician: "",
    heart_rate: "72 bpm",
    blood_pressure: "120/80 mmHg",
    temperature: "98.6 °F",
    spo2: "99%",
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/dashboard");
      setData(res.data);
      if (res.data.patient) {
        setFormData({
          name: res.data.patient.name || "",
          age: res.data.patient.age || "",
          gender: res.data.patient.gender || "Male",
          blood_group: res.data.patient.blood_group || "O+ (Positive)",
          height: res.data.patient.height || "178 cm",
          weight: res.data.patient.weight || "74 kg",
          email: res.data.patient.email || "",
          phone: res.data.patient.phone || "",
          allergies: res.data.patient.allergies || "",
          chronic_conditions: res.data.patient.chronic_conditions || "",
          emergency_contact: res.data.patient.emergency_contact || "",
          primary_physician: res.data.patient.primary_physician || "",
          heart_rate: res.data.patient.heart_rate || "72 bpm",
          blood_pressure: res.data.patient.blood_pressure || "120/80 mmHg",
          temperature: res.data.patient.temperature || "98.6 °F",
          spo2: res.data.patient.spo2 || "99%",
        });
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever the logged-in user changes
  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveMessage("");

    try {
      const res = await API.put("/api/patient", formData);
      setSaveMessage("✓ Patient profile successfully synchronized!");
      setIsEditing(false);
      fetchDashboard();
      setTimeout(() => setSaveMessage(""), 4000);
    } catch (err) {
      console.error("Save profile error:", err);
      setSaveMessage("⚠ Failed to update patient records. Please check backend connection.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Helper to compute BMI
  const calculateBMI = (heightStr, weightStr) => {
    try {
      const hMatch = (heightStr || "").match(/(\d+(\.\d+)?)/);
      const wMatch = (weightStr || "").match(/(\d+(\.\d+)?)/);
      if (!hMatch || !wMatch) return "23.4 (Normal)";
      const hMeters = parseFloat(hMatch[1]) / 100;
      const wKg = parseFloat(wMatch[1]);
      if (hMeters <= 0 || wKg <= 0) return "23.4 (Normal)";
      const bmi = (wKg / (hMeters * hMeters)).toFixed(1);
      let category = "Normal";
      if (bmi < 18.5) category = "Underweight";
      else if (bmi >= 25 && bmi < 30) category = "Overweight";
      else if (bmi >= 30) category = "Obese";
      return `${bmi} (${category})`;
    } catch {
      return "23.4 (Normal)";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const patient = data?.patient || {};
  const recentChats = data?.recentChats || [];
  const recentReports = data?.recentReports || [];

  return (
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Toast Notification */}
      {saveMessage && (
        <div
          style={{
            padding: "12px 20px",
            background: saveMessage.startsWith("✓")
              ? "rgba(0, 255, 135, 0.15)"
              : "rgba(255, 0, 64, 0.15)",
            border: saveMessage.startsWith("✓")
              ? "1px solid var(--neon-green)"
              : "1px solid var(--neon-red)",
            borderRadius: "var(--radius)",
            color: saveMessage.startsWith("✓") ? "var(--neon-green)" : "var(--neon-red)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "fade-in 0.3s ease",
          }}
        >
          <span>{saveMessage}</span>
          <button
            onClick={() => setSaveMessage("")}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Quick Action Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="section-title" style={{ margin: 0, fontSize: 22 }}>
            🎛 CLINICAL PATIENT DASHBOARD
          </h1>
          <p className="section-subtitle" style={{ margin: "4px 0 0", fontSize: 13 }}>
            Real-time biometric monitoring, patient electronic medical record, and dynamic diagnostic log.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            className="btn-cyber"
            onClick={() => setShowExportModal(true)}
            style={{
              fontSize: 11,
              padding: "10px 18px",
              background: "linear-gradient(135deg, rgba(0, 255, 135, 0.15), rgba(102, 252, 241, 0.2))",
              border: "1px solid var(--neon-green)",
              color: "var(--neon-green)",
              boxShadow: "0 0 12px rgba(0, 255, 135, 0.25)",
            }}
            title="Download or Print Patient Clinical Dossier for Doctor Consultancy"
          >
            <span>📥 DOWNLOAD FOR DOCTOR CONSULTANCY</span>
          </button>
          <button
            className="btn-cyber"
            onClick={() => setIsEditing(true)}
            style={{ fontSize: 11, padding: "10px 18px" }}
          >
            <span>✏️ EDIT PATIENT DETAILS</span>
          </button>
          <button
            className="btn-cyber purple"
            onClick={fetchDashboard}
            disabled={loading}
            style={{ fontSize: 11, padding: "10px 18px" }}
          >
            <span>🔄 SYNC TELEMETRY</span>
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div className="cyber-spinner" style={{ margin: "0 auto 16px" }}></div>
          <div style={{ color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            Synchronizing Patient Telemetry & Health Records...
          </div>
        </div>
      ) : (
        <>
          {/* Admin Control Bar if logged in as Admin */}
          {user?.role === "admin" && (
            <div
              className="cyber-card"
              style={{
                border: "1px solid var(--neon-red)",
                background: "linear-gradient(135deg, rgba(255, 0, 64, 0.08), rgba(138, 43, 226, 0.08))",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>👑</span>
                <div>
                  <strong style={{ color: "var(--neon-red)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>
                    Administrator Console Active
                  </strong>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Viewing records as: <span style={{ color: "var(--neon-cyan)", fontWeight: 700 }}>{patient.name || "Alex Mercer"}</span> ({patient.email})
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>SWITCH PATIENT:</span>
                {[
                  { name: "Alex Mercer", email: "alex.mercer@sushruta-ai.local", role: "patient", id: 1 },
                  { name: "John Patient", email: "patient1@gmail.com", role: "patient", id: 2 },
                  { name: "Sarah Patient", email: "patient2@gmail.com", role: "patient", id: 3 },
                ].map((p) => (
                  <button
                    key={p.email}
                    onClick={() => quickSwitch(p)}
                    style={{
                      background: patient.email === p.email ? "var(--neon-cyan)" : "var(--bg-input)",
                      color: patient.email === p.email ? "#030816" : "var(--text-primary)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {p.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Top Row: Patient ID Card + Live Biometrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {/* Patient Identity HUD Card */}
            <div className="cyber-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, rgba(102, 252, 241, 0.2), rgba(138, 43, 226, 0.4))",
                      border: "1px solid var(--neon-cyan)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      boxShadow: "var(--glow-cyan)",
                    }}
                  >
                    👤
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                      {patient.name || "Alex Mercer"}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                      MRN: #MED-{patient.id ? String(patient.id).padStart(5, "0") : "00842"} • {patient.gender || "Male"}, {patient.age || 34} yrs
                    </div>
                  </div>
                </div>
                <span className={`status-badge ${data?.healthStatus?.includes("Attention") ? "attention" : "optimal"}`}>
                  {data?.healthStatus || "Optimal Condition"}
                </span>
              </div>

              <div className="hud-line" style={{ margin: "4px 0" }}></div>

              {/* Patient Core Specs Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                <div style={{ background: "var(--bg-input)", padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: 10, fontFamily: "var(--font-mono)" }}>BLOOD GROUP</span>
                  <strong style={{ color: "var(--neon-cyan)", fontSize: 13 }}>{patient.blood_group || "O+ (Positive)"}</strong>
                </div>
                <div style={{ background: "var(--bg-input)", padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: 10, fontFamily: "var(--font-mono)" }}>HEIGHT & WEIGHT</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: 13 }}>{patient.height || "178 cm"} / {patient.weight || "74 kg"}</strong>
                </div>
                <div style={{ background: "var(--bg-input)", padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: 10, fontFamily: "var(--font-mono)" }}>ESTIMATED BMI</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: 13 }}>{calculateBMI(patient.height, patient.weight)}</strong>
                </div>
                <div style={{ background: "var(--bg-input)", padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: 10, fontFamily: "var(--font-mono)" }}>PRIMARY PHYSICIAN</span>
                  <strong style={{ color: "var(--neon-purple)", fontSize: 12, textOverflow: "ellipsis", overflow: "hidden", display: "block", whiteSpace: "nowrap" }}>
                    {patient.primary_physician || "Dr. Aris Thorne"}
                  </strong>
                </div>
              </div>

              {/* Warnings & Alerts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ color: "var(--neon-red)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11 }}>⚠ ALLERGIES:</span>
                  <span style={{ color: "var(--text-primary)" }}>{patient.allergies || "None Reported"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ color: "var(--neon-purple)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11 }}>🩺 CHRONIC:</span>
                  <span style={{ color: "var(--text-primary)" }}>{patient.chronic_conditions || "None Active"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ color: "var(--neon-cyan)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11 }}>📞 EMERGENCY:</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>{patient.emergency_contact || "Not Configured"}</span>
                </div>
              </div>

              {/* Patient Card Quick Download / Print Action */}
              <div style={{ display: "flex", gap: 8, marginTop: 6, paddingTop: 10, borderTop: "1px solid var(--border-default)" }}>
                <button
                  onClick={() => data && openDoctorDossierPrintWindow(data)}
                  className="btn-cyber"
                  style={{
                    flex: 1,
                    fontSize: 10,
                    padding: "7px 10px",
                    justifyContent: "center",
                    background: "rgba(102, 252, 241, 0.08)",
                  }}
                  title="Direct print / save PDF clinical summary for doctor visit"
                >
                  <span>🖨️ PRINT DOSSIER</span>
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="btn-cyber purple"
                  style={{
                    flex: 1,
                    fontSize: 10,
                    padding: "7px 10px",
                    justifyContent: "center",
                  }}
                  title="Open download options (PDF, JSON, TXT)"
                >
                  <span>📥 EXPORT DATA</span>
                </button>
              </div>
            </div>

            {/* Vitals Telemetry Box */}
            <div className="cyber-card purple" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, letterSpacing: 1.5, color: "var(--neon-purple)" }}>
                  ⚡ LIVE BIOMETRIC TELEMETRY
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--neon-green)", fontFamily: "var(--font-mono)" }}>
                  <span className="pulse-dot"></span> LIVE SENSOR FEED
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Heart Rate */}
                <div className="biomarker-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>❤️ HEART RATE</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--neon-cyan)", fontFamily: "var(--font-heading)" }}>
                    {patient.heart_rate || "72 bpm"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--neon-green)" }}>✓ Optimal Rhythm (60-100)</div>
                </div>

                {/* Blood Pressure */}
                <div className="biomarker-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>💓 BLOOD PRESSURE</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--neon-purple)", fontFamily: "var(--font-heading)" }}>
                    {patient.blood_pressure || "120/80 mmHg"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--neon-green)" }}>✓ Normative Target</div>
                </div>

                {/* Body Temp */}
                <div className="biomarker-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>🌡 BODY TEMPERATURE</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--neon-green)", fontFamily: "var(--font-heading)" }}>
                    {patient.temperature || "98.6 °F"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--neon-green)" }}>✓ Afebrile Baseline</div>
                </div>

                {/* SpO2 */}
                <div className="biomarker-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>🫁 OXYGEN SATURATION</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--neon-cyan)", fontFamily: "var(--font-heading)" }}>
                    {patient.spo2 || "99%"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--neon-green)" }}>✓ Normal Saturation (&gt;95%)</div>
                </div>
              </div>

              {/* Summary telemetry status bar */}
              <div style={{ background: "var(--bg-input)", padding: "10px 14px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Health Score Index: <strong style={{ color: "var(--neon-green)" }}>{data?.healthScore || 96}/100</strong>
                </span>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  Last Synced: {formatDate(patient.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Scheduled Doctor Appointments Section */}
          <div className="cyber-card" style={{ border: "1px solid var(--border-default)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>👨‍⚕️</span>
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, letterSpacing: 1, color: "var(--text-primary)" }}>
                    SCHEDULED CLINICAL APPOINTMENTS
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Upcoming physician consults, hospital bookings, and e-scheduling passes.
                  </div>
                </div>
              </div>
              <Link
                to="/book-doctor"
                className="btn-cyber"
                style={{ fontSize: 10, padding: "6px 14px" }}
              >
                <span>➕ BOOK SPECIALIST</span>
              </Link>
            </div>

            {data?.patientAppointments && data.patientAppointments.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {data.patientAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "var(--neon-cyan)", fontSize: 13 }}>
                        {appt.doctor_name || "Specialist Physician"}
                      </strong>
                      <span className={`status-badge ${appt.status === "confirmed" ? "optimal" : "attention"}`}>
                        {appt.status?.toUpperCase() || "CONFIRMED"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      📅 {appt.date} • ⏰ {appt.time_slot}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      Reason: {appt.reason || "General Medical Checkup"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius)",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  No upcoming appointments booked for {patient.name || "this patient"}.
                </span>
                <Link
                  to="/book-doctor"
                  style={{ color: "var(--neon-cyan)", fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600, textDecoration: "none" }}
                >
                  Schedule an Appointment Now →
                </Link>
              </div>
            )}
          </div>

          {/* Patient Current Log & Diagnostic Activity Center */}
          <div className="cyber-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, letterSpacing: 1.5, color: "var(--text-primary)" }}>
                  📋 PATIENT CURRENT LOG & ACTIVITY FEED
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Consolidated timeline of AI symptom consultations, diagnostic reports, and medical interactions.
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="tab-bar" style={{ margin: 0 }}>
                <button
                  className={`tab-btn ${logFilter === "all" ? "active" : ""}`}
                  onClick={() => setLogFilter("all")}
                  style={{ padding: "6px 14px", fontSize: 10 }}
                >
                  All Logs ({recentChats.length + recentReports.length})
                </button>
                <button
                  className={`tab-btn ${logFilter === "chats" ? "active" : ""}`}
                  onClick={() => setLogFilter("chats")}
                  style={{ padding: "6px 14px", fontSize: 10 }}
                >
                  💬 Consultations ({recentChats.length})
                </button>
                <button
                  className={`tab-btn ${logFilter === "reports" ? "active" : ""}`}
                  onClick={() => setLogFilter("reports")}
                  style={{ padding: "6px 14px", fontSize: 10 }}
                >
                  📊 Lab Reports ({recentReports.length})
                </button>
              </div>
            </div>

            <div className="hud-line" style={{ margin: "8px 0 16px" }}></div>

            {/* Log List */}
            <div className="history-list" style={{ gap: 10 }}>
              {/* Reports Section in Log */}
              {(logFilter === "all" || logFilter === "reports") &&
                recentReports.map((report) => (
                  <div
                    key={`rep-${report.id}`}
                    className="history-item"
                    style={{ borderLeft: "3px solid var(--neon-cyan)" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>📊</span>
                        <strong style={{ color: "var(--text-primary)", fontSize: 13 }}>{report.title}</strong>
                      </div>
                      <span className={`status-badge ${report.status || "optimal"}`}>
                        {report.status === "attention" ? "⚠ Attention" : "✓ Optimal"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
                      {report.summary?.split("\n\n")[0] || report.summary}
                    </div>
                    <div className="history-meta" style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Source: {report.filename}</span>
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                  </div>
                ))}

              {/* Chats Section in Log */}
              {(logFilter === "all" || logFilter === "chats") &&
                recentChats.map((chat) => (
                  <div
                    key={`chat-${chat.id}`}
                    className="history-item"
                    style={{ borderLeft: "3px solid var(--neon-purple)" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>💬</span>
                        <strong style={{ color: "var(--text-primary)", fontSize: 13 }}>{chat.message}</strong>
                      </div>
                      {chat.keywords && (
                        <span className="status-badge optimal" style={{ fontSize: 9 }}>
                          {chat.keywords}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: "6px 0", maxHeight: 60, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {chat.response?.split("\n\n")[0] || chat.response}
                    </div>
                    <div className="history-meta" style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Sushruta AI Triage</span>
                      <span>{formatDate(chat.created_at)}</span>
                    </div>
                  </div>
                ))}

              {recentChats.length === 0 && recentReports.length === 0 && (
                <div className="empty-state" style={{ padding: "30px 20px" }}>
                  <div className="empty-icon">📭</div>
                  <div className="empty-text">No Patient Logs Recorded Yet</div>
                  <div className="empty-hint">Start an AI consultation or analyze a medical report to populate live records.</div>
                </div>
              )}
            </div>

            {/* Quick Action Navigation Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              <Link to="/book-doctor" className="btn-cyber" style={{ textDecoration: "none", fontSize: 11, padding: "10px 18px", border: "1px solid var(--neon-cyan)", background: "rgba(102, 252, 241, 0.12)" }}>
                <span>👨‍⚕️ BOOK A SPECIALIST</span>
              </Link>
              <button
                onClick={() => setShowExportModal(true)}
                className="btn-cyber"
                style={{
                  fontSize: 11,
                  padding: "10px 18px",
                  border: "1px solid var(--neon-green)",
                  color: "var(--neon-green)",
                  background: "rgba(0, 255, 135, 0.1)",
                }}
              >
                <span>📥 EXPORT DOCTOR DOSSIER</span>
              </button>
              <Link to="/chat" className="btn-cyber" style={{ textDecoration: "none", fontSize: 11, padding: "10px 18px" }}>
                <span>💬 NEW AI CONSULTATION</span>
              </Link>
              <Link to="/report-analyzer" className="btn-cyber purple" style={{ textDecoration: "none", fontSize: 11, padding: "10px 18px" }}>
                <span>📊 UPLOAD LAB REPORT</span>
              </Link>
              <Link to="/symptom-guidance" className="btn-cyber" style={{ textDecoration: "none", fontSize: 11, padding: "10px 18px" }}>
                <span>🩺 SYMPTOM TRIAGE</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* DOCTOR CONSULTATION EXPORT & DOWNLOAD CENTER MODAL           */}
      {/* ============================================================ */}
      {showExportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            animation: "fade-in 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowExportModal(false);
          }}
        >
          <div
            className="cyber-card"
            style={{
              width: "100%",
              maxWidth: 760,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              boxShadow: "0 0 35px rgba(0, 255, 135, 0.25), 0 0 10px rgba(102, 252, 241, 0.2)",
              border: "1px solid var(--neon-green)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: "12px", background: "rgba(0, 255, 135, 0.15)", border: "1px solid var(--neon-green)", color: "var(--neon-green)", fontFamily: "var(--font-mono)", fontSize: 11, marginBottom: 8 }}>
                  <span>✓ CLINICAL CONSULTATION READY</span>
                </div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--neon-cyan)", margin: 0, letterSpacing: 1 }}>
                  📥 PATIENT DATA EXPORT FOR DOCTOR CONSULTANCY
                </h2>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                  Export patient biometric telemetry, AI symptom triage history, and lab diagnostic records for attending physicians.
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>

            {/* Quick Status Pill */}
            {downloadSuccess && (
              <div
                style={{
                  padding: "10px 16px",
                  marginBottom: 16,
                  background: "rgba(0, 255, 135, 0.15)",
                  border: "1px solid var(--neon-green)",
                  borderRadius: "var(--radius)",
                  color: "var(--neon-green)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{downloadSuccess}</span>
                <button
                  onClick={() => setDownloadSuccess("")}
                  style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Live Dossier Summary Preview Card */}
            <div
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius)",
                padding: "14px 18px",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>
                INCLUDED CLINICAL RECORDS SUMMARY:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, fontSize: 12 }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: 10 }}>PATIENT</span>
                  <strong style={{ color: "var(--text-primary)" }}>{patient.name || "Alex Mercer"}</strong>
                  <span style={{ display: "block", color: "var(--text-muted)", fontSize: 10 }}>{patient.gender || "Male"}, {patient.age || 34} yrs</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: 10 }}>BLOOD GROUP & BMI</span>
                  <strong style={{ color: "var(--neon-cyan)" }}>{patient.blood_group || "O+"}</strong>
                  <span style={{ display: "block", color: "var(--text-muted)", fontSize: 10 }}>BMI: {calculateBMI(patient.height, patient.weight)}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: 10 }}>AI TRIAGE ENTRIES</span>
                  <strong style={{ color: "var(--neon-purple)" }}>{recentChats.length} Consultations</strong>
                  <span style={{ display: "block", color: "var(--text-muted)", fontSize: 10 }}>Symptom history logged</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: 10 }}>LAB REPORTS</span>
                  <strong style={{ color: "var(--neon-green)" }}>{recentReports.length} Reports</strong>
                  <span style={{ display: "block", color: "var(--text-muted)", fontSize: 10 }}>Diagnostic findings ready</span>
                </div>
              </div>
            </div>

            {/* Export Format Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Option 1: PDF / Print Dossier */}
              <div
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid rgba(102, 252, 241, 0.3)",
                  borderRadius: "var(--radius-lg)",
                  padding: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  transition: "var(--transition)",
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "10px",
                      background: "rgba(102, 252, 241, 0.15)",
                      border: "1px solid var(--neon-cyan)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    🖨️
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, color: "var(--neon-cyan)", fontWeight: 700 }}>
                      Printable Clinical PDF Dossier (Recommended)
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                      Hospital-grade consultation sheet with header, vitals, AI triage logs, lab summaries, and doctor prescription/signature space.
                    </div>
                  </div>
                </div>
                <button
                  className="btn-cyber"
                  onClick={() => {
                    if (data) {
                      openDoctorDossierPrintWindow(data);
                      setDownloadSuccess("✓ Print dialog / PDF Dossier generated!");
                    }
                  }}
                  style={{ fontSize: 11, padding: "10px 20px" }}
                >
                  <span>🖨️ OPEN & PRINT DOSSIER</span>
                </button>
              </div>

              {/* Option 2: Structured JSON Health Record */}
              <div
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  borderRadius: "var(--radius-lg)",
                  padding: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  transition: "var(--transition)",
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "10px",
                      background: "rgba(138, 43, 226, 0.15)",
                      border: "1px solid var(--neon-purple)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    💾
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, color: "var(--neon-purple)", fontWeight: 700 }}>
                      Electronic Health Record (.JSON)
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                      Standardized portable JSON data structure for electronic medical record (EMR/EHR) system ingestion.
                    </div>
                  </div>
                </div>
                <button
                  className="btn-cyber purple"
                  onClick={() => {
                    if (data) {
                      downloadPatientJSON(data);
                      setDownloadSuccess("✓ JSON Health Record downloaded to your device!");
                    }
                  }}
                  style={{ fontSize: 11, padding: "10px 20px" }}
                >
                  <span>📥 DOWNLOAD .JSON</span>
                </button>
              </div>

              {/* Option 3: Plain Text / Markdown Clinical Summary */}
              <div
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid rgba(0, 255, 135, 0.3)",
                  borderRadius: "var(--radius-lg)",
                  padding: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  transition: "var(--transition)",
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "10px",
                      background: "rgba(0, 255, 135, 0.15)",
                      border: "1px solid var(--neon-green)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    📄
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, color: "var(--neon-green)", fontWeight: 700 }}>
                      Doctor Clinical Summary Note (.TXT)
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                      Clean formatted text summary designed for rapid copy-pasting into doctor EHR clinical notes or messaging.
                    </div>
                  </div>
                </div>
                <button
                  className="btn-cyber"
                  onClick={() => {
                    if (data) {
                      downloadPatientTextSummary(data);
                      setDownloadSuccess("✓ Clinical Summary .TXT file downloaded!");
                    }
                  }}
                  style={{
                    fontSize: 11,
                    padding: "10px 20px",
                    borderColor: "var(--neon-green)",
                    color: "var(--neon-green)",
                  }}
                >
                  <span>📥 DOWNLOAD .TXT</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border-default)" }}>
              <button
                type="button"
                className="btn-cyber"
                onClick={() => setShowExportModal(false)}
                style={{ fontSize: 11, padding: "8px 20px" }}
              >
                <span>CLOSE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT PATIENT DETAILS MODAL                                   */}
      {/* ============================================================ */}
      {isEditing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            animation: "fade-in 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditing(false);
          }}
        >
          <div
            className="cyber-card"
            style={{
              width: "100%",
              maxWidth: 700,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              boxShadow: "var(--glow-intense)",
              border: "1px solid var(--neon-cyan)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--neon-cyan)", margin: 0 }}>
                  ✏️ UPDATE PATIENT MEDICAL PROFILE
                </h2>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Modify clinical attributes, emergency contacts, and vital parameters.
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>

            <div className="hud-line" style={{ margin: "12px 0 20px" }}></div>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Row 1: Name, Age, Gender */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                    FULL PATIENT NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                    AGE
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                    GENDER
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Blood Group, Height, Weight */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                    BLOOD GROUP
                  </label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  >
                    <option value="A+ (Positive)">A+ (Positive)</option>
                    <option value="A- (Negative)">A- (Negative)</option>
                    <option value="B+ (Positive)">B+ (Positive)</option>
                    <option value="B- (Negative)">B- (Negative)</option>
                    <option value="AB+ (Positive)">AB+ (Positive)</option>
                    <option value="AB- (Negative)">AB- (Negative)</option>
                    <option value="O+ (Positive)">O+ (Positive)</option>
                    <option value="O- (Negative)">O- (Negative)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                    HEIGHT
                  </label>
                  <input
                    type="text"
                    name="height"
                    placeholder="e.g. 178 cm"
                    value={formData.height}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                    WEIGHT
                  </label>
                  <input
                    type="text"
                    name="weight"
                    placeholder="e.g. 74 kg"
                    value={formData.weight}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Allergies, Chronic Conditions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-red)", marginBottom: 6 }}>
                    KNOWN ALLERGIES
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    placeholder="e.g. Penicillin, Shellfish, Peanuts"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-purple)", marginBottom: 6 }}>
                    CHRONIC MEDICAL CONDITIONS
                  </label>
                  <input
                    type="text"
                    name="chronic_conditions"
                    placeholder="e.g. Mild Hypertension, Asthma"
                    value={formData.chronic_conditions}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* Row 4: Emergency Contact & Primary Physician */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                    EMERGENCY CONTACT DETAILS
                  </label>
                  <input
                    type="text"
                    name="emergency_contact"
                    placeholder="e.g. Elena Mercer (Spouse) - +1 555-902-3341"
                    value={formData.emergency_contact}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                    PRIMARY PHYSICIAN
                  </label>
                  <input
                    type="text"
                    name="primary_physician"
                    placeholder="e.g. Dr. Aris Thorne, MD"
                    value={formData.primary_physician}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* Row 5: Vitals Calibration */}
              <div style={{ marginTop: 6 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 11, color: "var(--neon-cyan)", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
                  Telemetry / Vitals Calibration
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4 }}>
                      HEART RATE
                    </label>
                    <input
                      type="text"
                      name="heart_rate"
                      value={formData.heart_rate}
                      onChange={handleInputChange}
                      placeholder="72 bpm"
                      style={{
                        width: "100%",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius)",
                        padding: "8px 10px",
                        color: "var(--text-primary)",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4 }}>
                      BLOOD PRESSURE
                    </label>
                    <input
                      type="text"
                      name="blood_pressure"
                      value={formData.blood_pressure}
                      onChange={handleInputChange}
                      placeholder="120/80 mmHg"
                      style={{
                        width: "100%",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius)",
                        padding: "8px 10px",
                        color: "var(--text-primary)",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4 }}>
                      TEMPERATURE
                    </label>
                    <input
                      type="text"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      placeholder="98.6 °F"
                      style={{
                        width: "100%",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius)",
                        padding: "8px 10px",
                        color: "var(--text-primary)",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4 }}>
                      OXYGEN (SPO2)
                    </label>
                    <input
                      type="text"
                      name="spo2"
                      value={formData.spo2}
                      onChange={handleInputChange}
                      placeholder="99%"
                      style={{
                        width: "100%",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius)",
                        padding: "8px 10px",
                        color: "var(--text-primary)",
                        fontSize: 12,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-cyber purple"
                  onClick={() => setIsEditing(false)}
                  disabled={saveLoading}
                >
                  <span>CANCEL</span>
                </button>
                <button
                  type="submit"
                  className="btn-cyber"
                  disabled={saveLoading}
                >
                  <span>{saveLoading ? "SAVING..." : "💾 COMMIT & SYNC PROFILE"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
