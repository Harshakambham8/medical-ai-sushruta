import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const SPECIALIZATIONS = [
  "All",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "General Medicine",
  "Neurology",
  "Orthopedics",
  "Psychiatry",
  "Gynecology",
  "Pediatrics",
  "Nephrology",
  "Gastroenterology",
  "Hematology"
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function BookDoctorView() {
  const { user, doctor: authDoctor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Role resolution: allow manual toggle for testing or default to auth role
  const actualRole = user?.role === "doctor" ? "doctor" : "patient";
  const [viewMode, setViewMode] = useState(actualRole); // "patient" | "doctor"

  // Shared Data State
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Patient View States
  const [patientTab, setPatientTab] = useState("browse"); // "browse" | "my-appointments"
  const [search, setSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");

  // Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("");
  const [consultationType, setConsultationType] = useState("In-Clinic"); // "In-Clinic" | "Video Telehealth" | "Report Review"
  const [bookingNotes, setBookingNotes] = useState("");
  const [patientName, setPatientName] = useState(user?.name || "Alex Mercer");
  const [patientEmail, setPatientEmail] = useState(user?.email || "alex.mercer@sushruta-ai.local");
  const [patientPhone, setPatientPhone] = useState(user?.contactInfo || "+1 (555) 382-9012");
  const [slotStatusData, setSlotStatusData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState({ type: "", text: "" });

  // Doctor View States
  const [doctorTab, setDoctorTab] = useState("queue"); // "queue" | "schedule"
  const [activeDoctorProfile, setActiveDoctorProfile] = useState(null);
  const [doctorNotesDraft, setDoctorNotesDraft] = useState({});
  const [scheduleDays, setScheduleDays] = useState(["Monday", "Wednesday", "Friday"]);
  const [scheduleFees, setScheduleFees] = useState("120");
  const [scheduleBio, setScheduleBio] = useState("");
  const [schedulePhone, setSchedulePhone] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleStatusMsg, setScheduleStatusMsg] = useState("");

  // Sync state if user auth changes
  useEffect(() => {
    if (user?.role === "doctor") {
      setViewMode("doctor");
    } else {
      setViewMode("patient");
    }
    if (user?.name) setPatientName(user.name);
    if (user?.email) setPatientEmail(user.email);
    if (user?.contactInfo) setPatientPhone(user.contactInfo);
  }, [user]);

  // Handle URL query parameters (e.g. ?specialty=Endocrinologist from Report Analyzer)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const specParam = params.get("specialty");
    if (specParam) {
      const match = SPECIALIZATIONS.find(
        (s) => s.toLowerCase() === specParam.toLowerCase()
      );
      if (match) setSelectedSpecialization(match);
      else setSelectedSpecialization("All");
      setPatientTab("browse");
    }
  }, [location.search]);

  // Fetch doctors and appointments
  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, apptRes] = await Promise.all([
        API.get("/api/doctors"),
        API.get("/api/appointments")
      ]);
      const docs = docRes.data.data || [];
      const appts = apptRes.data.data || [];
      setDoctors(docs);
      setAppointments(appts);

      // Resolve doctor profile for doctor view
      const loggedDoctor =
        (authDoctor && (authDoctor.id === user?.doctorId || (user?.email && authDoctor.email && authDoctor.email.toLowerCase() === user.email.toLowerCase())))
          ? authDoctor
          : docs.find((d) => d.id === user?.doctorId || (user?.email && d.email && d.email.toLowerCase() === user.email.toLowerCase())) ||
            docs.find((d) => d.name.toLowerCase().includes("aris")) ||
            docs[0];

      if (loggedDoctor) {
        setActiveDoctorProfile(loggedDoctor);
        let avail = [];
        try {
          avail = typeof loggedDoctor.availability === "string" ? JSON.parse(loggedDoctor.availability) : (loggedDoctor.availability || []);
        } catch {}
        setScheduleDays(avail.map((a) => a.day) || ["Monday", "Wednesday", "Friday"]);
        setScheduleFees(String(loggedDoctor.fees || 120));
        setScheduleBio(loggedDoctor.bio || "");
        setSchedulePhone(loggedDoctor.phone || "");
      }
    } catch (err) {
      console.error("Failed to load doctor scheduling data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch available slots dynamically when doctor or date changes
  const fetchAvailableSlots = async (docId, dateStr) => {
    if (!docId || !dateStr) {
      setSlotStatusData(null);
      return;
    }
    setLoadingSlots(true);
    setBookingSlot("");
    try {
      const res = await API.get(`/api/appointments/available-slots?doctorId=${docId}&date=${dateStr}`);
      setSlotStatusData(res.data);
    } catch (err) {
      console.warn("Could not check slot availability:", err);
      setSlotStatusData(null);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (dateStr) => {
    setBookingDate(dateStr);
    if (selectedDoctor) {
      fetchAvailableSlots(selectedDoctor.id, dateStr);
    }
  };

  const handleStartBooking = (doc) => {
    setSelectedDoctor(doc);
    setBookingDate("");
    setBookingSlot("");
    setBookingNotes("");
    setSlotStatusData(null);
    setBookingMessage({ type: "", text: "" });
    setShowBookingModal(true);
  };

  // Submit appointment booking
  const handleBookAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !bookingDate || !bookingSlot) {
      setBookingMessage({ type: "error", text: "Please select doctor, appointment date, and time slot." });
      return;
    }

    setBookingLoading(true);
    setBookingMessage({ type: "", text: "" });

    const notesPayload = `[Mode: ${consultationType}] ${bookingNotes.trim() ? bookingNotes.trim() : "Standard consultation"}`;

    try {
      const res = await API.post("/api/appointments", {
        doctorId: selectedDoctor.id,
        date: bookingDate,
        timeSlot: bookingSlot,
        notes: notesPayload,
        patientName: patientName.trim() || "Alex Mercer",
        patientEmail: patientEmail.trim() || "alex.mercer@sushruta-ai.local",
        patientPhone: patientPhone.trim() || "+1 (555) 382-9012"
      });

      setBookingMessage({
        type: "success",
        text: `✓ ${res.data.message || "Consultation confirmed successfully!"}`
      });

      fetchData();
      setTimeout(() => {
        setShowBookingModal(false);
        setPatientTab("my-appointments");
      }, 1500);
    } catch (err) {
      setBookingMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to reserve slot. Slot may have been taken."
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel appointment (Patient or Doctor)
  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled consultation?")) return;
    try {
      await API.delete(`/api/appointments/${apptId}`);
      fetchData();
    } catch (err) {
      alert("Failed to cancel appointment.");
    }
  };

  // Doctor Updates Appointment Status (Confirm, Complete)
  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await API.patch(`/api/appointments/${apptId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert("Failed to update consultation status.");
    }
  };

  // Doctor Saves Clinical Notes
  const handleSaveDoctorNotes = async (apptId) => {
    const notesText = doctorNotesDraft[apptId];
    if (notesText === undefined) return;
    try {
      await API.patch(`/api/appointments/${apptId}/notes`, { notes: notesText });
      alert("✓ Clinical consultation notes saved successfully.");
      fetchData();
    } catch (err) {
      alert("Failed to save notes.");
    }
  };

  // Doctor Saves Schedule & Fees
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!activeDoctorProfile) return;
    setSavingSchedule(true);
    setScheduleStatusMsg("");

    const defaultSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
    const availability = scheduleDays.map((day) => ({
      day,
      slots: defaultSlots
    }));

    try {
      await API.patch(`/api/doctors/${activeDoctorProfile.id}/schedule`, {
        fees: scheduleFees,
        availability,
        bio: scheduleBio,
        phone: schedulePhone
      });
      setScheduleStatusMsg("✓ Schedule and consultation parameters updated successfully!");
      fetchData();
      setTimeout(() => setScheduleStatusMsg(""), 3000);
    } catch (err) {
      setScheduleStatusMsg("⚠ Failed to update schedule. Please try again.");
    } finally {
      setSavingSchedule(false);
    }
  };

  // Filtered Doctors for Patient Directory
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

  // Patient Appointments (filtered to current user email/name)
  const patientEmailToMatch = (user?.email || "alex.mercer@sushruta-ai.local").toLowerCase();
  const patientAppointments = appointments.filter(
    (a) =>
      (a.patient_email && a.patient_email.toLowerCase() === patientEmailToMatch) ||
      (a.patient_name && a.patient_name.toLowerCase() === (user?.name || "").toLowerCase()) ||
      !a.patient_email // show defaults
  );

  // Doctor Appointments (filtered to active doctor id/name)
  const activeDoctorId = activeDoctorProfile?.id;
  const doctorAppointments = appointments.filter(
    (a) =>
      a.doctor_id === activeDoctorId ||
      (activeDoctorProfile?.name && a.doctor_name && a.doctor_name.toLowerCase() === activeDoctorProfile.name.toLowerCase())
  );

  // Generate Digital e-Pass
  const printAppointmentPass = (appt) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print your consultation e-pass.");
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Consultation e-Pass - ${appt.doctor_name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #0f172a; padding: 30px; }
    .pass-box { max-width: 580px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 12px; padding: 28px; background: #f8fafc; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 18px; font-weight: 800; color: #0f172a; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 16px 0; font-size: 13px; }
    .label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-weight: 700; color: #0f172a; font-size: 14px; margin-top: 2px; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
    .barcode { font-family: monospace; font-size: 22px; letter-spacing: 6px; text-align: center; margin-top: 20px; padding: 10px; background: #ffffff; border: 1px dashed #94a3b8; }
    .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 18px; line-height: 1.4; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 580px; margin: 0 auto 16px; display: flex; justify-content: space-between;">
    <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">🖨️ Print Consultation Pass</button>
    <button onclick="window.close()" style="background: #e2e8f0; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close</button>
  </div>
  <div class="pass-box">
    <div class="header">
      <div>
        <div class="brand">⚕ MEDICAL AI SUSHRUTA</div>
        <div style="font-size: 11px; color: #64748b;">OFFICIAL CLINICAL CONSULTATION e-PASS</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">✓ ${appt.status.toUpperCase()}</span>
        <div style="font-size: 11px; font-family: monospace; font-weight: 700; margin-top: 4px;">PASS #APP-${String(appt.id).padStart(5, "0")}</div>
      </div>
    </div>
    <div class="grid">
      <div>
        <div class="label">ATTENDING SPECIALIST</div>
        <div class="value">${appt.doctor_name}</div>
        <div style="font-size: 12px; color: #0284c7;">${appt.specialization}</div>
      </div>
      <div>
        <div class="label">PATIENT DETAILS</div>
        <div class="value">${appt.patient_name}</div>
        <div style="font-size: 12px; color: #64748b;">${appt.patient_phone || appt.patient_email || "Verified Patient"}</div>
      </div>
      <div>
        <div class="label">CONSULTATION DATE</div>
        <div class="value" style="color: #0f172a;">${appt.date}</div>
      </div>
      <div>
        <div class="label">RESERVED TIME SLOT</div>
        <div class="value" style="color: #7c3aed;">${appt.time_slot}</div>
      </div>
    </div>
    <div style="background: #ffffff; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; margin-top: 10px;">
      <span class="label">CONSULTATION REASON / CLINICAL NOTES:</span>
      <div style="margin-top: 4px; color: #334155; line-height: 1.5;">${appt.notes || "Standard clinical checkup & evaluation."}</div>
    </div>
    <div class="barcode">
      |||| | ||||| || |||||| | |||| |||||
    </div>
    <div class="footer">
      Please present this digital pass at the clinic front desk or connect to your telehealth room 10 minutes prior to session.
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Header & Role Perspective Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", borderRadius: "12px", background: "rgba(102, 252, 241, 0.12)", border: "1px solid var(--neon-cyan)", color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 11, marginBottom: 8 }}>
            <span>🟢 e-SCHEDULING ACTIVE • {doctors.length} SPECIALISTS ON-DUTY</span>
          </div>
          <h1 className="section-title" style={{ margin: 0, fontSize: 22 }}>
            {viewMode === "doctor"
              ? "👨‍⚕️ DOCTOR PORTAL & CONSULTATION QUEUE"
              : "👨‍⚕️ BOOK A DOCTOR & CLINICAL e-SCHEDULING"}
          </h1>
          <p className="section-subtitle" style={{ margin: "4px 0 0", fontSize: 13 }}>
            {viewMode === "doctor"
              ? `Manage booked patient consultations, confirm appointments, write clinical notes, and adjust availability slots.`
              : `Find verified medical specialists, check real-time availability slots, schedule consultations, and generate digital e-passes.`}
          </p>
        </div>

        {/* View Perspective Switcher & Current Account Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", padding: "4px 8px", display: "flex", gap: 4 }}>
            <button
              onClick={() => setViewMode("patient")}
              style={{
                background: viewMode === "patient" ? "var(--neon-cyan)" : "transparent",
                color: viewMode === "patient" ? "#0B0C10" : "var(--text-secondary)",
                border: "none",
                borderRadius: "16px",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "var(--transition)"
              }}
            >
              🧑 Patient View
            </button>
            <button
              onClick={() => setViewMode("doctor")}
              style={{
                background: viewMode === "doctor" ? "var(--neon-purple)" : "transparent",
                color: viewMode === "doctor" ? "#FFFFFF" : "var(--text-secondary)",
                border: "none",
                borderRadius: "16px",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "var(--transition)"
              }}
            >
              👨‍⚕️ Doctor Portal
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PERSPECTIVE A: PATIENT VIEW                                  */}
      {/* ============================================================ */}
      {viewMode === "patient" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Patient Tabs */}
          <div className="tab-bar" style={{ margin: 0 }}>
            <button
              className={`tab-btn ${patientTab === "browse" ? "active" : ""}`}
              onClick={() => setPatientTab("browse")}
            >
              🩺 Browse Specialists ({filteredDoctors.length})
            </button>
            <button
              className={`tab-btn ${patientTab === "my-appointments" ? "active" : ""}`}
              onClick={() => setPatientTab("my-appointments")}
            >
              📋 My Appointments ({patientAppointments.length})
            </button>
          </div>

          {/* TAB 1: BROWSE SPECIALISTS DIRECTORY */}
          {patientTab === "browse" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Search & Specialization Filters */}
              <div className="cyber-card" style={{ padding: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
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

              {/* Doctors Cards Grid */}
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>
                  {filteredDoctors.map((doc) => {
                    let avail = [];
                    try {
                      avail = typeof doc.availability === "string" ? JSON.parse(doc.availability) : (doc.availability || []);
                    } catch {}
                    const availDays = avail.map((a) => a.day).join(", ");

                    return (
                      <div
                        key={doc.id}
                        className="cyber-card"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: 16,
                          padding: 20
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <div
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: "12px",
                                  background: "linear-gradient(135deg, rgba(102, 252, 241, 0.2), rgba(138, 43, 226, 0.3))",
                                  border: "1px solid var(--neon-cyan)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 26,
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
                              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                                ({doc.reviews_count || 32} reviews)
                              </div>
                            </div>
                          </div>

                          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginTop: 12, marginBottom: 12 }}>
                            {doc.bio || `Specialized physician in ${doc.specialization} with extensive diagnostic expertise.`}
                          </p>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                            <div>⏱ {doc.experience || 6}+ yrs exp</div>
                            <div>💰 ${doc.fees || 120} / session</div>
                          </div>

                          <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-secondary)" }}>
                            <strong style={{ color: "var(--neon-cyan)" }}>Days:</strong> {availDays || "Mon, Wed, Fri"}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                          <button
                            className="btn-cyber"
                            style={{ flex: 1, padding: "10px" }}
                            onClick={() => handleStartBooking(doc)}
                          >
                            <span>📅 BOOK APPOINTMENT</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PATIENT'S "MY APPOINTMENTS" */}
          {patientTab === "my-appointments" && (
            <div className="cyber-card" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: "var(--neon-cyan)", margin: 0 }}>
                  MY SCHEDULED CONSULTATIONS ({patientAppointments.length})
                </h3>
                <button onClick={fetchData} className="btn-cyber purple" style={{ padding: "4px 12px", fontSize: 11 }}>
                  <span>🔄 Refresh Status</span>
                </button>
              </div>

              {patientAppointments.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>No appointments scheduled yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Browse our verified specialists and book your first clinical consultation.</div>
                  <button
                    onClick={() => setPatientTab("browse")}
                    className="btn-cyber"
                    style={{ marginTop: 16, padding: "8px 20px" }}
                  >
                    <span>Browse Specialists</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {patientAppointments.map((appt) => {
                    const isCancelled = appt.status === "cancelled";
                    const isCompleted = appt.status === "completed";

                    return (
                      <div
                        key={appt.id}
                        style={{
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius)",
                          padding: "16px 20px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: 16
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                              {appt.doctor_name}
                            </span>
                            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)" }}>
                              ({appt.specialization})
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 4,
                                background: isCancelled ? "rgba(255, 0, 64, 0.15)" : isCompleted ? "rgba(102, 252, 241, 0.15)" : "rgba(0, 255, 135, 0.15)",
                                color: isCancelled ? "var(--neon-red)" : isCompleted ? "var(--neon-cyan)" : "var(--neon-green)",
                                border: `1px solid ${isCancelled ? "var(--neon-red)" : isCompleted ? "var(--neon-cyan)" : "var(--neon-green)"}`
                              }}
                            >
                              {appt.status.toUpperCase()}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
                            <div>📅 Date: <strong style={{ color: "var(--text-primary)" }}>{appt.date}</strong></div>
                            <div>⏰ Time Slot: <strong style={{ color: "var(--neon-purple)" }}>{appt.time_slot}</strong></div>
                          </div>

                          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>
                            <strong style={{ color: "var(--text-primary)" }}>Patient Complaint:</strong> {appt.notes || "General consultation"}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button
                            onClick={() => printAppointmentPass(appt)}
                            className="btn-cyber purple"
                            style={{ padding: "6px 14px", fontSize: 11 }}
                          >
                            <span>🖨️ View e-Pass</span>
                          </button>

                          {!isCancelled && !isCompleted && (
                            <button
                              onClick={() => handleCancelAppointment(appt.id)}
                              style={{
                                background: "rgba(255, 0, 64, 0.1)",
                                border: "1px solid var(--neon-red)",
                                color: "var(--neon-red)",
                                borderRadius: "var(--radius)",
                                padding: "6px 12px",
                                fontSize: 11,
                                cursor: "pointer",
                                fontWeight: 600
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* PERSPECTIVE B: DOCTOR PORTAL                                 */}
      {/* ============================================================ */}
      {viewMode === "doctor" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Unverified / Pending Notice */}
          {activeDoctorProfile && !activeDoctorProfile.is_approved && (
            <div
              className="cyber-card"
              style={{
                padding: "16px 20px",
                background: "rgba(255, 170, 0, 0.12)",
                border: "1px solid #ffaa00",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ fontSize: 28 }}>⏳</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ffaa00" }}>
                  Practice Privileges Pending Administrator Verification
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  Your physician credentials and original certification document (<strong>{activeDoctorProfile.certificate_filename || "Medical License"}</strong>) have been submitted to the Admin.
                  Your public appointment booking schedule will become visible to patients once verified by the Administrator.
                </div>
              </div>
            </div>
          )}

          {/* Doctor Info Banner */}
          <div
            className="cyber-card"
            style={{
              padding: 20,
              background: "linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(11, 12, 16, 0.8))",
              border: "1px solid var(--neon-purple)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: "rgba(138, 43, 226, 0.3)", border: "1px solid var(--neon-purple)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                  {activeDoctorProfile?.avatar || "👨‍⚕️"}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
                    {activeDoctorProfile?.name || "Dr. Aris Thorne, MD"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--neon-purple)", fontFamily: "var(--font-mono)" }}>
                    Specialist: {activeDoctorProfile?.specialization || "Cardiology & Internal Medicine"} • Active Doctor Station
                  </div>
                </div>
              </div>

              {/* Quick Queue Stats */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ background: "var(--bg-input)", padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--neon-cyan)" }}>{doctorAppointments.length}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>TOTAL PATIENTS</div>
                </div>
                <div style={{ background: "var(--bg-input)", padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--neon-green)" }}>
                    {doctorAppointments.filter((a) => a.status === "confirmed").length}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>CONFIRMED</div>
                </div>
                <div style={{ background: "var(--bg-input)", padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--neon-purple)" }}>
                    {doctorAppointments.filter((a) => a.status === "completed").length}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>COMPLETED</div>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Portal Tabs */}
          <div className="tab-bar" style={{ margin: 0 }}>
            <button
              className={`tab-btn ${doctorTab === "queue" ? "active" : ""}`}
              onClick={() => setDoctorTab("queue")}
            >
              📋 Patient Consultation Queue ({doctorAppointments.length})
            </button>
            <button
              className={`tab-btn ${doctorTab === "schedule" ? "active" : ""}`}
              onClick={() => setDoctorTab("schedule")}
            >
              ⚙️ My Availability & Schedule Settings
            </button>
          </div>

          {/* TAB B1: PATIENT QUEUE */}
          {doctorTab === "queue" && (
            <div className="cyber-card" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 14, color: "var(--neon-cyan)", margin: 0 }}>
                  CONSULTATION QUEUE & ENCOUNTER NOTES
                </h3>
                <button onClick={fetchData} className="btn-cyber purple" style={{ padding: "4px 12px", fontSize: 11 }}>
                  <span>🔄 Refresh Queue</span>
                </button>
              </div>

              {doctorAppointments.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🩺</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>No patient bookings registered for this profile yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Patients booking appointments with this doctor will immediately appear here.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {doctorAppointments.map((appt) => {
                    const isConfirmed = appt.status === "confirmed";
                    const isCompleted = appt.status === "completed";
                    const isCancelled = appt.status === "cancelled";

                    return (
                      <div
                        key={appt.id}
                        style={{
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius)",
                          padding: "18px 22px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 12
                        }}
                      >
                        {/* Top Row: Patient Info, Date, Status */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                                🧑 {appt.patient_name}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  background: isCancelled ? "rgba(255, 0, 64, 0.15)" : isCompleted ? "rgba(102, 252, 241, 0.15)" : "rgba(0, 255, 135, 0.15)",
                                  color: isCancelled ? "var(--neon-red)" : isCompleted ? "var(--neon-cyan)" : "var(--neon-green)",
                                  border: `1px solid ${isCancelled ? "var(--neon-red)" : isCompleted ? "var(--neon-cyan)" : "var(--neon-green)"}`
                                }}
                              >
                                {appt.status.toUpperCase()}
                              </span>
                            </div>

                            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                              Contact: {appt.patient_phone || "Not provided"} • {appt.patient_email}
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                              📅 {appt.date}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--neon-purple)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                              ⏰ {appt.time_slot}
                            </div>
                          </div>
                        </div>

                        {/* Patient's Symptoms Description */}
                        <div style={{ background: "rgba(11, 12, 16, 0.6)", padding: "10px 14px", borderRadius: "var(--radius)", fontSize: 12, color: "var(--text-secondary)" }}>
                          <strong style={{ color: "var(--neon-cyan)" }}>Patient Chief Complaint: </strong>
                          {appt.notes || "Standard clinical checkup & consultation."}
                        </div>

                        {/* Doctor's Encounter Notes Input */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                          <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-purple)" }}>
                            ✏️ DOCTOR CLINICAL ENCOUNTER NOTES & PRESCRIPTION:
                          </label>
                          <div style={{ display: "flex", gap: 10 }}>
                            <input
                              type="text"
                              placeholder="Record doctor assessment, recommendations, or prescribed medication..."
                              defaultValue={appt.notes}
                              onChange={(e) => setDoctorNotesDraft((prev) => ({ ...prev, [appt.id]: e.target.value }))}
                              style={{
                                flex: 1,
                                background: "var(--bg-input)",
                                border: "1px solid var(--border-default)",
                                borderRadius: "var(--radius)",
                                padding: "8px 12px",
                                color: "var(--text-primary)",
                                fontSize: 12
                              }}
                            />
                            <button
                              onClick={() => handleSaveDoctorNotes(appt.id)}
                              className="btn-cyber purple"
                              style={{ padding: "8px 14px", fontSize: 11 }}
                            >
                              <span>Save Notes</span>
                            </button>
                          </div>
                        </div>

                        {/* Status Actions */}
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 4 }}>
                          <button
                            onClick={() => printAppointmentPass(appt)}
                            className="btn-cyber purple"
                            style={{ padding: "6px 12px", fontSize: 11 }}
                          >
                            <span>🖨️ Consultation Pass</span>
                          </button>

                          {!isCompleted && !isCancelled && (
                            <button
                              onClick={() => handleUpdateStatus(appt.id, "completed")}
                              className="btn-cyber"
                              style={{ padding: "6px 14px", fontSize: 11 }}
                            >
                              <span>✓ Mark Visited / Completed</span>
                            </button>
                          )}

                          {!isCancelled && (
                            <button
                              onClick={() => handleUpdateStatus(appt.id, "cancelled")}
                              style={{
                                background: "rgba(255, 0, 64, 0.1)",
                                border: "1px solid var(--neon-red)",
                                color: "var(--neon-red)",
                                borderRadius: "var(--radius)",
                                padding: "6px 12px",
                                fontSize: 11,
                                cursor: "pointer",
                                fontWeight: 600
                              }}
                            >
                              ✕ Cancel Session
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB B2: DOCTOR SCHEDULE & AVAILABILITY SETTINGS */}
          {doctorTab === "schedule" && (
            <div className="cyber-card" style={{ padding: 24, maxWidth: 650 }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: "var(--neon-purple)", marginBottom: 16 }}>
                ⚙️ DOCTOR AVAILABILITY & DUTY SETTINGS
              </h3>

              <form onSubmit={handleSaveSchedule} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 8 }}>
                    CONSULTATION DAYS ON DUTY:
                  </label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {DAYS_OF_WEEK.map((day) => {
                      const isChecked = scheduleDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setScheduleDays(scheduleDays.filter((d) => d !== day));
                            } else {
                              setScheduleDays([...scheduleDays, day]);
                            }
                          }}
                          style={{
                            background: isChecked ? "var(--neon-purple)" : "var(--bg-input)",
                            color: isChecked ? "#fff" : "var(--text-secondary)",
                            border: isChecked ? "1px solid var(--neon-purple)" : "1px solid var(--border-default)",
                            borderRadius: "20px",
                            padding: "6px 14px",
                            fontSize: 12,
                            fontFamily: "var(--font-mono)",
                            cursor: "pointer"
                          }}
                        >
                          {isChecked ? `✓ ${day}` : day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 6 }}>
                      CONSULTATION FEE ($ USD):
                    </label>
                    <input
                      type="number"
                      value={scheduleFees}
                      onChange={(e) => setScheduleFees(e.target.value)}
                      style={{
                        width: "100%",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius)",
                        padding: "8px 12px",
                        color: "var(--text-primary)",
                        fontSize: 13
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 6 }}>
                      CLINICAL CONTACT PHONE:
                    </label>
                    <input
                      type="text"
                      value={schedulePhone}
                      onChange={(e) => setSchedulePhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      style={{
                        width: "100%",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius)",
                        padding: "8px 12px",
                        color: "var(--text-primary)",
                        fontSize: 13
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 6 }}>
                    SPECIALIST BIO & CLINICAL CREDENTIALS:
                  </label>
                  <textarea
                    rows={3}
                    value={scheduleBio}
                    onChange={(e) => setScheduleBio(e.target.value)}
                    placeholder="Briefly state clinical sub-specialties, hospital affiliations, and areas of expertise..."
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "8px 12px",
                      color: "var(--text-primary)",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)"
                    }}
                  />
                </div>

                {scheduleStatusMsg && (
                  <div style={{ fontSize: 12, color: scheduleStatusMsg.startsWith("✓") ? "var(--neon-green)" : "var(--neon-red)", fontFamily: "var(--font-mono)" }}>
                    {scheduleStatusMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="btn-cyber purple"
                  style={{ alignSelf: "flex-start", padding: "10px 24px" }}
                >
                  <span>{savingSchedule ? "Saving Changes..." : "💾 Update Doctor Schedule"}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* BOOKING MODAL (PATIENT EXPERIENCE)                           */}
      {/* ============================================================ */}
      {showBookingModal && selectedDoctor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11, 12, 16, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20
          }}
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="cyber-card"
            style={{
              maxWidth: 580,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              boxShadow: "var(--glow-cyan)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: "var(--neon-cyan)" }}>
                  SCHEDULE CLINICAL CONSULTATION
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                  Specialist: <strong style={{ color: "var(--text-primary)" }}>{selectedDoctor.name}</strong> ({selectedDoctor.specialization})
                </div>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookAppointmentSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Consultation Type Selector */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 6 }}>
                  CONSULTATION FORMAT:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {["In-Clinic", "Video Telehealth", "Report Review"].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setConsultationType(fmt)}
                      style={{
                        background: consultationType === fmt ? "var(--neon-cyan)" : "var(--bg-input)",
                        color: consultationType === fmt ? "#0B0C10" : "var(--text-secondary)",
                        border: consultationType === fmt ? "1px solid var(--neon-cyan)" : "1px solid var(--border-default)",
                        borderRadius: "var(--radius)",
                        padding: "8px 6px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {fmt === "In-Clinic" ? "🏥 Clinic" : fmt === "Video Telehealth" ? "💻 Video" : "📄 Lab Review"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 6 }}>
                  APPOINTMENT DATE:
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius)",
                    padding: "10px 14px",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontFamily: "var(--font-mono)"
                  }}
                  required
                />
              </div>

              {/* Real-Time Interactive Slot Selector */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 6 }}>
                  INTERACTIVE TIME SLOT:
                </label>

                {!bookingDate ? (
                  <div style={{ padding: "12px", background: "var(--bg-input)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                    Select a date above to view real-time availability slots.
                  </div>
                ) : loadingSlots ? (
                  <div style={{ padding: "12px", textAlign: "center", color: "var(--neon-cyan)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                    Checking doctor availability slots...
                  </div>
                ) : slotStatusData ? (
                  <div>
                    {!slotStatusData.isOnDuty && (
                      <div style={{ padding: "8px 12px", background: "rgba(255, 184, 0, 0.15)", border: "1px solid var(--neon-amber)", borderRadius: "var(--radius)", color: "var(--neon-amber)", fontSize: 11, marginBottom: 10 }}>
                        ⚠ {selectedDoctor.name} is scheduled off-duty on {slotStatusData.dayName}s. Normal days: {slotStatusData.availableDays?.join(", ") || "Mon, Wed, Fri"}.
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {slotStatusData.slots.map((item, idx) => {
                        const isSelected = bookingSlot === item.slot;
                        const isBooked = item.isBooked;

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setBookingSlot(item.slot)}
                            style={{
                              background: isSelected
                                ? "var(--neon-cyan)"
                                : isBooked
                                ? "rgba(255, 255, 255, 0.04)"
                                : "var(--bg-input)",
                              color: isSelected
                                ? "#0B0C10"
                                : isBooked
                                ? "var(--text-muted)"
                                : "var(--text-primary)",
                              border: isSelected
                                ? "1px solid var(--neon-cyan)"
                                : isBooked
                                ? "1px solid rgba(255, 255, 255, 0.05)"
                                : "1px solid var(--border-default)",
                              borderRadius: "var(--radius)",
                              padding: "10px 6px",
                              fontSize: 11,
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                              cursor: isBooked ? "not-allowed" : "pointer",
                              textDecoration: isBooked ? "line-through" : "none"
                            }}
                          >
                            {item.slot}
                            {isBooked && <span style={{ display: "block", fontSize: 9, color: "var(--neon-red)" }}>BOOKED</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Patient Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                    PATIENT NAME:
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "8px 12px",
                      color: "var(--text-primary)",
                      fontSize: 12
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                    PHONE NUMBER:
                  </label>
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "8px 12px",
                      color: "var(--text-primary)",
                      fontSize: 12
                    }}
                  />
                </div>
              </div>

              {/* Symptoms / Notes */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                  CHIEF COMPLAINT / SYMPTOMS:
                </label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Describe your current symptoms or reason for scheduling..."
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius)",
                    padding: "8px 12px",
                    color: "var(--text-primary)",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)"
                  }}
                />
              </div>

              {bookingMessage.text && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    background: bookingMessage.type === "success" ? "rgba(0, 255, 135, 0.15)" : "rgba(255, 0, 64, 0.15)",
                    color: bookingMessage.type === "success" ? "var(--neon-green)" : "var(--neon-red)",
                    border: `1px solid ${bookingMessage.type === "success" ? "var(--neon-green)" : "var(--neon-red)"}`
                  }}
                >
                  {bookingMessage.text}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="btn-cyber purple"
                  style={{ padding: "8px 16px", fontSize: 12 }}
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || !bookingSlot}
                  className="btn-cyber"
                  style={{ padding: "8px 24px", fontSize: 12 }}
                >
                  <span>{bookingLoading ? "Reserving Slot..." : "CONFIRM & GENERATE e-PASS"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
