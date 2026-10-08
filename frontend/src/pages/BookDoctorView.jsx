import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";

const SPECIALIZATIONS = [
  "All",
  "Cardiology",
  "Dermatology",
  "General Medicine",
  "Neurology",
  "Orthopedics",
  "Psychiatry",
  "Gynecology",
  "Pediatrics"
];

export default function BookDoctorView() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "schedule" | "appointments" | "register"
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");

  // Booking Form State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState({ type: "", text: "" });

  // Doctor Details Modal State
  const [viewDoctorModal, setViewDoctorModal] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // New Doctor Registration State
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "General Medicine",
    email: "",
    phone: "",
    bio: "",
    experience: "5",
    fees: "100",
    avatar: "👨‍⚕️",
    days: ["Monday", "Wednesday", "Friday"]
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState("");

  // Fetch doctors & appointments
  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, apptRes] = await Promise.all([
        API.get("/api/doctors"),
        API.get("/api/appointments")
      ]);
      setDoctors(docRes.data.data || []);
      setAppointments(apptRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch doctors/appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec =
      selectedSpecialization === "All" ||
      doc.specialization.toLowerCase() === selectedSpecialization.toLowerCase();
    const matchesSearch =
      !search.trim() ||
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase()) ||
      (doc.bio && doc.bio.toLowerCase().includes(search.toLowerCase()));
    return matchesSpec && matchesSearch;
  });

  // Handle date change and resolve available slots for doctor
  const handleDateChange = (dateVal, doctor = selectedDoctor) => {
    setBookingDate(dateVal);
    setBookingSlot("");
    setBookingMessage({ type: "", text: "" });

    if (!dateVal || !doctor) {
      setAvailableSlots([]);
      return;
    }

    const d = new Date(dateVal);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[d.getUTCDay() !== undefined ? d.getDay() : 0];

    const schedule = doctor.availability?.find(
      (avail) => avail.day.toLowerCase() === dayName.toLowerCase()
    );

    if (schedule && schedule.slots && schedule.slots.length > 0) {
      setAvailableSlots(schedule.slots);
    } else {
      setAvailableSlots([]);
      const availableDays = (doctor.availability || []).map((a) => a.day).join(", ");
      setBookingMessage({
        type: "warning",
        text: `⚠ ${doctor.name} is not on duty on ${dayName}s. Available days: ${availableDays || "None listed"}.`
      });
    }
  };

  // Open booking modal for a specific doctor
  const handleStartBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingDate("");
    setBookingSlot("");
    setBookingNotes("");
    setAvailableSlots([]);
    setBookingMessage({ type: "", text: "" });
    setShowBookingModal(true);
  };

  // Submit appointment booking
  const handleBookAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !bookingDate || !bookingSlot) {
      setBookingMessage({ type: "error", text: "Please select doctor, date, and time slot." });
      return;
    }

    setBookingLoading(true);
    setBookingMessage({ type: "", text: "" });

    try {
      const res = await API.post("/api/appointments", {
        doctorId: selectedDoctor.id,
        date: bookingDate,
        timeSlot: bookingSlot,
        notes: bookingNotes,
      });

      setBookingMessage({
        type: "success",
        text: `✓ ${res.data.message || "Appointment scheduled successfully!"}`
      });

      fetchData();
      setTimeout(() => {
        setShowBookingModal(false);
        setActiveTab("appointments");
      }, 1500);
    } catch (err) {
      setBookingMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to reserve slot. Please select another slot."
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await API.delete(`/api/appointments/${apptId}`);
      fetchData();
    } catch (err) {
      console.error("Cancel appointment error:", err);
      alert("Failed to cancel appointment.");
    }
  };

  // Register New Doctor Form Submit
  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegMessage("");

    const defaultSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
    const availability = newDoctor.days.map((day) => ({
      day,
      slots: defaultSlots
    }));

    try {
      const res = await API.post("/api/doctors", {
        name: newDoctor.name,
        specialization: newDoctor.specialization,
        email: newDoctor.email,
        phone: newDoctor.phone,
        bio: newDoctor.bio,
        experience: newDoctor.experience,
        fees: newDoctor.fees,
        avatar: newDoctor.avatar,
        availability
      });

      setRegMessage("✓ Doctor successfully registered & approved!");
      fetchData();
      setTimeout(() => {
        setRegMessage("");
        setActiveTab("browse");
      }, 1200);
    } catch (err) {
      setRegMessage("⚠ Failed to register doctor profile. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  // Generate Printable Appointment e-Pass
  const printAppointmentPass = (appt) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print your appointment pass.");
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Appointment e-Pass - ${appt.doctor_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    body { font-family: 'Inter', sans-serif; background: #fff; color: #0f172a; padding: 24px; }
    .pass-box { max-width: 580px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 8px; padding: 28px; background: #f8fafc; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 18px; font-weight: 800; }
    .pass-title { font-size: 12px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #0284c7; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 16px 0; font-size: 13px; }
    .label { font-size: 10px; font-weight: 600; color: #64748b; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; }
    .value { font-weight: 700; color: #0f172a; font-size: 14px; margin-top: 2px; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
    .barcode { font-family: 'JetBrains Mono', monospace; font-size: 20px; letter-spacing: 4px; text-align: center; margin-top: 20px; padding: 10px; background: #ffffff; border: 1px dashed #94a3b8; }
    .footer { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 18px; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 580px; margin: 0 auto 16px; display: flex; justify-content: space-between;">
    <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600;">🖨️ Print Pass</button>
    <button onclick="window.close()" style="background: #e2e8f0; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>
  </div>
  <div class="pass-box">
    <div class="header">
      <div>
        <div class="brand">⚕ MEDICAL AI SUSHRUTA</div>
        <div style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">CLINICAL CONSULTATION e-PASS</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">✓ CONFIRMED</span>
        <div class="pass-title">PASS #APP-${String(appt.id).padStart(5, "0")}</div>
      </div>
    </div>
    <div class="grid">
      <div>
        <div class="label">ATTENDING SPECIALIST</div>
        <div class="value">${appt.doctor_name}</div>
        <div style="font-size: 12px; color: #0284c7;">${appt.specialization}</div>
      </div>
      <div>
        <div class="label">PATIENT NAME</div>
        <div class="value">${appt.patient_name}</div>
        <div style="font-size: 11px; color: #64748b;">${appt.patient_phone || "Primary Patient"}</div>
      </div>
      <div>
        <div class="label">APPOINTMENT DATE</div>
        <div class="value" style="color: #0f172a;">${appt.date}</div>
      </div>
      <div>
        <div class="label">SESSION TIME SLOT</div>
        <div class="value" style="color: #7c3aed;">${appt.time_slot}</div>
      </div>
    </div>
    <div style="background: #ffffff; padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 12px;">
      <span class="label">REASON / CLINICAL NOTES:</span>
      <div style="margin-top: 4px; color: #334155;">${appt.notes || "Standard clinical follow-up"}</div>
    </div>
    <div class="barcode">
      |||| | ||||| || |||||| | |||| |||||
    </div>
    <div class="footer">
      Please present this pass at the clinical reception 10 minutes prior to your scheduled consultation slot.
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="book-doctor-container" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header & Mode Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: "12px", background: "rgba(102, 252, 241, 0.12)", border: "1px solid var(--neon-cyan)", color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 11, marginBottom: 8 }}>
            <span>🟢 e-SCHEDULING ACTIVE • {doctors.length} APPROVED SPECIALISTS</span>
          </div>
          <h1 className="section-title" style={{ margin: 0, fontSize: 22 }}>
            👨‍⚕️ BOOK A DOCTOR & CLINICAL e-SCHEDULING
          </h1>
          <p className="section-subtitle" style={{ margin: "4px 0 0", fontSize: 13 }}>
            Reserve appointments with verified medical specialists, manage consultation slots, and access digital e-passes.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="tab-bar" style={{ margin: 0 }}>
          <button
            className={`tab-btn ${activeTab === "browse" ? "active" : ""}`}
            onClick={() => setActiveTab("browse")}
          >
            🩺 Browse Specialists ({filteredDoctors.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "schedule" ? "active" : ""}`}
            onClick={() => {
              if (doctors.length > 0 && !selectedDoctor) {
                setSelectedDoctor(doctors[0]);
              }
              setActiveTab("schedule");
            }}
          >
            📅 Book Session
          </button>
          <button
            className={`tab-btn ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            📋 My Appointments ({appointments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            ➕ Register Specialist
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: BROWSE SPECIALISTS DIRECTORY                          */}
      {/* ============================================================ */}
      {activeTab === "browse" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Search & Specialization Filters */}
          <div className="cyber-card" style={{ padding: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="🔍 Search doctors by name, specialty, or condition..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
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
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec === "All" ? "All Medical Specialties" : spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Specialty Chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  style={{
                    background: selectedSpecialization === spec ? "var(--neon-cyan)" : "var(--bg-input)",
                    color: selectedSpecialization === spec ? "#0B0C10" : "var(--text-secondary)",
                    border: selectedSpecialization === spec ? "1px solid var(--neon-cyan)" : "1px solid var(--border-default)",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    cursor: "pointer",
                    transition: "var(--transition)",
                    fontWeight: selectedSpecialization === spec ? 700 : 500,
                  }}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Cards Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div className="cyber-spinner" style={{ margin: "0 auto 16px" }}></div>
              <div style={{ color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                Loading verified clinical specialists...
              </div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🩺</div>
              <div className="empty-text">No Specialists Found</div>
              <div className="empty-hint">Try adjusting your search keywords or specialty filter.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="cyber-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div>
                    {/* Card Top: Avatar, Name, Specialization */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, rgba(102, 252, 241, 0.2), rgba(138, 43, 226, 0.3))",
                            border: "1px solid var(--neon-cyan)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 26,
                            boxShadow: "var(--glow-cyan)",
                          }}
                        >
                          {doc.avatar || "👨‍⚕️"}
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                            {doc.name}
                          </div>
                          <span
                            style={{
                              display: "inline-block",
                              background: "rgba(102, 252, 241, 0.12)",
                              color: "var(--neon-cyan)",
                              border: "1px solid rgba(102, 252, 241, 0.3)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: 10,
                              fontFamily: "var(--font-mono)",
                              marginTop: 3,
                            }}
                          >
                            {doc.specialization}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ color: "var(--neon-amber)", fontSize: 12, fontWeight: 700 }}>
                          ★ {doc.rating || 4.9}
                        </span>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          ({doc.reviews_count || 32} reviews)
                        </div>
                      </div>
                    </div>

                    <div className="hud-line" style={{ margin: "12px 0" }}></div>

                    {/* Bio Snippet */}
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, height: 56, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {doc.bio}
                    </p>

                    {/* Experience & Fee */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 0 8px" }}>
                      <div style={{ background: "var(--bg-input)", padding: "6px 10px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                        <span style={{ fontSize: 9, color: "var(--text-muted)", display: "block", fontFamily: "var(--font-mono)" }}>EXPERIENCE</span>
                        <strong style={{ fontSize: 12, color: "var(--text-primary)" }}>{doc.experience || 5}+ Years</strong>
                      </div>
                      <div style={{ background: "var(--bg-input)", padding: "6px 10px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                        <span style={{ fontSize: 9, color: "var(--text-muted)", display: "block", fontFamily: "var(--font-mono)" }}>CONSULTATION FEE</span>
                        <strong style={{ fontSize: 12, color: "var(--neon-green)" }}>${doc.fees || 120} / Visit</strong>
                      </div>
                    </div>

                    {/* Duty Days */}
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--neon-purple)" }}>Active Days: </span>
                      {(doc.availability || []).map((a) => a.day).join(", ") || "Mon, Wed, Fri"}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button
                      className="btn-cyber"
                      onClick={() => handleStartBooking(doc)}
                      style={{ flex: 2, fontSize: 11, padding: "8px 12px", justifyContent: "center" }}
                    >
                      <span>📅 BOOK SESSION</span>
                    </button>
                    <button
                      className="btn-cyber purple"
                      onClick={() => setViewDoctorModal(doc)}
                      style={{ flex: 1, fontSize: 11, padding: "8px 10px", justifyContent: "center" }}
                    >
                      <span>PROFILE</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: INTERACTIVE e-SCHEDULING FORM                         */}
      {/* ============================================================ */}
      {activeTab === "schedule" && (
        <div className="cyber-card" style={{ maxWidth: 800, margin: "0 auto", padding: 28 }}>
          <div style={{ borderBottom: "1px solid var(--border-default)", paddingBottom: 14, marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--neon-cyan)", margin: 0 }}>
              📅 SCHEDULE CLINICAL DOCTOR CONSULTATION
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Select a medical specialist, select available working dates, and pick a confirmed session slot.
            </p>
          </div>

          {bookingMessage.text && (
            <div
              style={{
                padding: "12px 18px",
                marginBottom: 18,
                background: bookingMessage.type === "success"
                  ? "rgba(0, 255, 135, 0.15)"
                  : bookingMessage.type === "warning"
                  ? "rgba(255, 184, 0, 0.15)"
                  : "rgba(255, 0, 64, 0.15)",
                border: bookingMessage.type === "success"
                  ? "1px solid var(--neon-green)"
                  : bookingMessage.type === "warning"
                  ? "1px solid var(--neon-amber)"
                  : "1px solid var(--neon-red)",
                borderRadius: "var(--radius)",
                color: bookingMessage.type === "success"
                  ? "var(--neon-green)"
                  : bookingMessage.type === "warning"
                  ? "var(--neon-amber)"
                  : "var(--neon-red)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            >
              {bookingMessage.text}
            </div>
          )}

          <form onSubmit={handleBookAppointmentSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Step 1: Doctor Picker */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                1. SELECT ATTENDING MEDICAL SPECIALIST
              </label>
              <select
                value={selectedDoctor ? selectedDoctor.id : ""}
                onChange={(e) => {
                  const doc = doctors.find((d) => String(d.id) === e.target.value);
                  setSelectedDoctor(doc);
                  if (bookingDate && doc) {
                    handleDateChange(bookingDate, doc);
                  }
                }}
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
              >
                <option value="">-- Choose Specialist --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization} (${d.fees}/session)
                  </option>
                ))}
              </select>
            </div>

            {selectedDoctor && (
              <div
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius)",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                <div>
                  <strong style={{ color: "var(--neon-cyan)" }}>{selectedDoctor.name}</strong> • {selectedDoctor.specialization}
                  <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>
                    On-duty Schedule: {(selectedDoctor.availability || []).map((a) => a.day).join(", ")}
                  </div>
                </div>
                <div style={{ color: "var(--neon-green)", fontWeight: 700 }}>
                  ${selectedDoctor.fees} / Session
                </div>
              </div>
            )}

            {/* Step 2: Date Picker */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                2. CONSULTATION DATE
              </label>
              <input
                type="date"
                min={todayStr}
                value={bookingDate}
                onChange={(e) => handleDateChange(e.target.value)}
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

            {/* Step 3: Slot Selector */}
            {availableSlots.length > 0 && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 8 }}>
                  3. SELECT AVAILABLE TIME SLOT ({availableSlots.length} AVAILABLE)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookingSlot(slot)}
                      style={{
                        background: bookingSlot === slot ? "var(--neon-cyan)" : "var(--bg-input)",
                        color: bookingSlot === slot ? "#0B0C10" : "var(--text-primary)",
                        border: bookingSlot === slot ? "1px solid var(--neon-cyan)" : "1px solid var(--border-default)",
                        borderRadius: "var(--radius)",
                        padding: "10px 8px",
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        fontWeight: bookingSlot === slot ? 700 : 500,
                        cursor: "pointer",
                        transition: "var(--transition)",
                      }}
                    >
                      ⏱ {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Reason / Notes */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                4. REASON FOR VISIT / CLINICAL SYMPTOMS
              </label>
              <textarea
                rows={3}
                placeholder="Describe your chief symptoms, reason for visit, or current medications..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  resize: "vertical",
                }}
              ></textarea>
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
              <button
                type="submit"
                className="btn-cyber"
                disabled={bookingLoading || !selectedDoctor || !bookingDate || !bookingSlot}
                style={{ fontSize: 12, padding: "12px 24px" }}
              >
                <span>{bookingLoading ? "RESERVING SLOT..." : "✓ CONFIRM & SCHEDULE APPOINTMENT"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: MY APPOINTMENTS & e-PASSES                            */}
      {/* ============================================================ */}
      {activeTab === "appointments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="cyber-card" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--neon-cyan)", margin: 0 }}>
                📋 SCHEDULED CLINICAL APPOINTMENTS ({appointments.length})
              </h2>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Confirmed consultations, real-time schedule statuses, and printable passes.
              </div>
            </div>
            <button
              className="btn-cyber"
              onClick={() => setActiveTab("schedule")}
              style={{ fontSize: 11, padding: "8px 16px" }}
            >
              <span>➕ BOOK NEW SESSION</span>
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <div className="empty-text">No Scheduled Appointments</div>
              <div className="empty-hint">Browse our medical specialists and book a consultation slot.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="cyber-card"
                  style={{
                    borderLeft: appt.status === "confirmed" ? "4px solid var(--neon-cyan)" : "4px solid var(--neon-amber)",
                    padding: 20,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>👨‍⚕️</span>
                        <strong style={{ fontSize: 15, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
                          {appt.doctor_name}
                        </strong>
                        <span
                          style={{
                            background: "rgba(138, 43, 226, 0.15)",
                            color: "var(--neon-purple)",
                            border: "1px solid rgba(138, 43, 226, 0.3)",
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {appt.specialization}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
                        Patient: <strong>{appt.patient_name}</strong> • Phone: {appt.patient_phone || "+1 (555) 382-9012"}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className={`status-badge ${appt.status === "confirmed" ? "optimal" : "attention"}`}>
                        {appt.status === "confirmed" ? "✓ Confirmed" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="hud-line" style={{ margin: "12px 0" }}></div>

                  {/* Session Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, fontSize: 12 }}>
                    <div style={{ background: "var(--bg-input)", padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", display: "block" }}>SCHEDULED DATE</span>
                      <strong style={{ color: "var(--neon-cyan)", fontSize: 13 }}>📅 {appt.date}</strong>
                    </div>
                    <div style={{ background: "var(--bg-input)", padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", display: "block" }}>TIME SLOT</span>
                      <strong style={{ color: "var(--neon-purple)", fontSize: 13 }}>⏱ {appt.time_slot}</strong>
                    </div>
                    <div style={{ background: "var(--bg-input)", padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", display: "block" }}>PASS CODE</span>
                      <strong style={{ color: "var(--text-primary)", fontSize: 12, fontFamily: "var(--font-mono)" }}>#APP-{String(appt.id).padStart(5, "0")}</strong>
                    </div>
                  </div>

                  {appt.notes && (
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 10, background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: "var(--radius)" }}>
                      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Reason: </span>
                      {appt.notes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                    <button
                      className="btn-cyber"
                      onClick={() => printAppointmentPass(appt)}
                      style={{ fontSize: 11, padding: "7px 14px" }}
                    >
                      <span>🖨️ PRINT e-PASS</span>
                    </button>
                    <button
                      className="btn-cyber red"
                      onClick={() => handleCancelAppointment(appt.id)}
                      style={{
                        fontSize: 11,
                        padding: "7px 14px",
                        border: "1px solid var(--neon-red)",
                        color: "var(--neon-red)",
                        background: "rgba(255, 0, 64, 0.1)",
                      }}
                    >
                      <span>✕ CANCEL</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: REGISTER NEW SPECIALIST                               */}
      {/* ============================================================ */}
      {activeTab === "register" && (
        <div className="cyber-card" style={{ maxWidth: 700, margin: "0 auto", padding: 28 }}>
          <div style={{ borderBottom: "1px solid var(--border-default)", paddingBottom: 14, marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--neon-purple)", margin: 0 }}>
              ➕ REGISTER & ONBOARD MEDICAL SPECIALIST
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Add a certified doctor profile and configure custom weekly availability slots.
            </p>
          </div>

          {regMessage && (
            <div
              style={{
                padding: "12px 18px",
                marginBottom: 16,
                background: regMessage.startsWith("✓") ? "rgba(0, 255, 135, 0.15)" : "rgba(255, 0, 64, 0.15)",
                border: regMessage.startsWith("✓") ? "1px solid var(--neon-green)" : "1px solid var(--neon-red)",
                borderRadius: "var(--radius)",
                color: regMessage.startsWith("✓") ? "var(--neon-green)" : "var(--neon-red)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            >
              {regMessage}
            </div>
          )}

          <form onSubmit={handleRegisterDoctor} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                  DOCTOR FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Emily Carter, MD"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
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
                  SPECIALIZATION
                </label>
                <select
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
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
                  {SPECIALIZATIONS.filter((s) => s !== "All").map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                  EXPERIENCE (YEARS)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newDoctor.experience}
                  onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
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
                  CONSULTATION FEE ($)
                </label>
                <input
                  type="number"
                  min="10"
                  value={newDoctor.fees}
                  onChange={(e) => setNewDoctor({ ...newDoctor, fees: e.target.value })}
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

            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 6 }}>
                CLINICAL BIOGRAPHY & EXPERTISE
              </label>
              <textarea
                rows={3}
                placeholder="Summary of qualifications, surgical expertise, or clinical focus..."
                value={newDoctor.bio}
                onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              ></textarea>
            </div>

            {/* Days of week picker */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 6 }}>
                WEEKLY ON-DUTY DAYS
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                  const isChecked = newDoctor.days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setNewDoctor({
                            ...newDoctor,
                            days: newDoctor.days.filter((d) => d !== day),
                          });
                        } else {
                          setNewDoctor({
                            ...newDoctor,
                            days: [...newDoctor.days, day],
                          });
                        }
                      }}
                      style={{
                        background: isChecked ? "var(--neon-purple)" : "var(--bg-input)",
                        color: isChecked ? "#fff" : "var(--text-secondary)",
                        border: isChecked ? "1px solid var(--neon-purple)" : "1px solid var(--border-default)",
                        borderRadius: "var(--radius)",
                        padding: "6px 12px",
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: isChecked ? 700 : 500,
                      }}
                    >
                      {isChecked ? "✓ " : ""}{day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
              <button
                type="submit"
                className="btn-cyber purple"
                disabled={regLoading || !newDoctor.name}
                style={{ fontSize: 12, padding: "10px 24px" }}
              >
                <span>{regLoading ? "REGISTERING..." : "💾 REGISTER SPECIALIST"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* QUICK BOOKING MODAL                                          */}
      {/* ============================================================ */}
      {showBookingModal && selectedDoctor && (
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
            if (e.target === e.currentTarget) setShowBookingModal(false);
          }}
        >
          <div
            className="cyber-card"
            style={{
              width: "100%",
              maxWidth: 600,
              padding: 28,
              boxShadow: "var(--glow-cyan)",
              border: "1px solid var(--neon-cyan)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span className="spec-badge" style={{ fontSize: 10, background: "rgba(102, 252, 241, 0.15)", color: "var(--neon-cyan)" }}>
                  {selectedDoctor.specialization}
                </span>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--text-primary)", margin: "4px 0 0" }}>
                  Schedule with {selectedDoctor.name}
                </h2>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Fee: <strong style={{ color: "var(--neon-green)" }}>${selectedDoctor.fees}</strong> • Active on: {(selectedDoctor.availability || []).map((a) => a.day).join(", ")}
                </div>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {bookingMessage.text && (
              <div
                style={{
                  padding: "10px 14px",
                  marginBottom: 14,
                  background: bookingMessage.type === "success"
                    ? "rgba(0, 255, 135, 0.15)"
                    : bookingMessage.type === "warning"
                    ? "rgba(255, 184, 0, 0.15)"
                    : "rgba(255, 0, 64, 0.15)",
                  border: bookingMessage.type === "success"
                    ? "1px solid var(--neon-green)"
                    : bookingMessage.type === "warning"
                    ? "1px solid var(--neon-amber)"
                    : "1px solid var(--neon-red)",
                  borderRadius: "var(--radius)",
                  color: bookingMessage.type === "success"
                    ? "var(--neon-green)"
                    : bookingMessage.type === "warning"
                    ? "var(--neon-amber)"
                    : "var(--neon-red)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                }}
              >
                {bookingMessage.text}
              </div>
            )}

            <form onSubmit={handleBookAppointmentSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                  SELECT DATE
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius)",
                    padding: "9px 12px",
                    color: "var(--text-primary)",
                    fontSize: 12,
                  }}
                />
              </div>

              {availableSlots.length > 0 && (
                <div>
                  <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 6 }}>
                    SELECT TIME SLOT ({availableSlots.length} AVAILABLE)
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingSlot(slot)}
                        style={{
                          background: bookingSlot === slot ? "var(--neon-cyan)" : "var(--bg-input)",
                          color: bookingSlot === slot ? "#0B0C10" : "var(--text-primary)",
                          border: bookingSlot === slot ? "1px solid var(--neon-cyan)" : "1px solid var(--border-default)",
                          borderRadius: "var(--radius)",
                          padding: "8px 6px",
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          fontWeight: bookingSlot === slot ? 700 : 500,
                          cursor: "pointer",
                        }}
                      >
                        ⏱ {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                  REASON FOR CONSULTATION / NOTES
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Follow-up on blood pressure or lab reports..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius)",
                    padding: "8px 12px",
                    color: "var(--text-primary)",
                    fontSize: 12,
                  }}
                ></textarea>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  className="btn-cyber purple"
                  onClick={() => setShowBookingModal(false)}
                  style={{ fontSize: 11, padding: "8px 16px" }}
                >
                  <span>CANCEL</span>
                </button>
                <button
                  type="submit"
                  className="btn-cyber"
                  disabled={bookingLoading || !bookingDate || !bookingSlot}
                  style={{ fontSize: 11, padding: "8px 18px" }}
                >
                  <span>{bookingLoading ? "RESERVING..." : "✓ CONFIRM APPOINTMENT"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DOCTOR FULL PROFILE MODAL                                    */}
      {/* ============================================================ */}
      {viewDoctorModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            animation: "fade-in 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewDoctorModal(null);
          }}
        >
          <div
            className="cyber-card"
            style={{
              width: "100%",
              maxWidth: 620,
              padding: 28,
              boxShadow: "var(--glow-purple)",
              border: "1px solid var(--neon-purple)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "12px",
                    background: "rgba(138, 43, 226, 0.2)",
                    border: "1px solid var(--neon-purple)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  {viewDoctorModal.avatar || "👨‍⚕️"}
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--text-primary)", margin: 0 }}>
                    {viewDoctorModal.name}
                  </h2>
                  <div style={{ color: "var(--neon-purple)", fontSize: 12, fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {viewDoctorModal.specialization} • {viewDoctorModal.experience}+ Years Experience
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewDoctorModal(null)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div className="hud-line" style={{ margin: "14px 0" }}></div>

            <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7, marginBottom: 16 }}>
              {viewDoctorModal.bio}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, marginBottom: 16 }}>
              <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>CONTACT EMAIL</span>
                <strong style={{ color: "var(--neon-cyan)" }}>{viewDoctorModal.email || "consult@sushruta-med.com"}</strong>
              </div>
              <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>DIRECT PHONE</span>
                <strong style={{ color: "var(--text-primary)" }}>{viewDoctorModal.phone || "+1 (555) 000-0000"}</strong>
              </div>
              <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>CONSULTATION FEE</span>
                <strong style={{ color: "var(--neon-green)" }}>${viewDoctorModal.fees} / Session</strong>
              </div>
              <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>RATING & TRUST</span>
                <strong style={{ color: "var(--neon-amber)" }}>★ {viewDoctorModal.rating || 4.9} ({viewDoctorModal.reviews_count || 40} reviews)</strong>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 6 }}>
                WEEKLY AVAILABILITY SCHEDULE:
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(viewDoctorModal.availability || []).map((avail) => (
                  <span
                    key={avail.day}
                    style={{
                      background: "rgba(102, 252, 241, 0.1)",
                      border: "1px solid rgba(102, 252, 241, 0.3)",
                      color: "var(--neon-cyan)",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    📅 {avail.day} ({avail.slots?.length || 6} slots)
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                className="btn-cyber"
                onClick={() => {
                  const doc = viewDoctorModal;
                  setViewDoctorModal(null);
                  handleStartBooking(doc);
                }}
                style={{ fontSize: 11, padding: "8px 18px" }}
              >
                <span>📅 BOOK THIS DOCTOR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
