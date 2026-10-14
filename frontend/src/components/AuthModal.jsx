import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const DOCTOR_SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Dermatology",
  "Endocrinology",
  "Orthopedics",
  "Psychiatry",
  "Pediatrics",
  "Gynecology",
  "Nephrology",
  "Gastroenterology",
  "Oncology",
  "Hematology",
  "Pulmonology",
  "Ophthalmology"
];

export default function AuthModal({ isOpen, onClose }) {
  const { user, login, logout, quickSwitch } = useAuth();
  const [activeTab, setActiveTab] = useState("login"); // "login" | "quick" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Registration state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("patient");
  const [regPhone, setRegPhone] = useState("");

  // Doctor-specific registration state
  const [regSpecialization, setRegSpecialization] = useState("General Medicine");
  const [regLicenseNumber, setRegLicenseNumber] = useState("");
  const [regExperience, setRegExperience] = useState("5");
  const [regFees, setRegFees] = useState("120");
  const [regBio, setRegBio] = useState("");
  const [regCertificateFile, setRegCertificateFile] = useState(null);
  const [fileDragActive, setFileDragActive] = useState(false);

  // Demo accounts
  const [demoAccounts, setDemoAccounts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setMessage({ type: "", text: "" });
      API.get("/api/auth/demo-accounts")
        .then((res) => setDemoAccounts(res.data.accounts || []))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: `✓ ${res.message}` });
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let res;
      if (regRole === "doctor") {
        if (!regCertificateFile) {
          setMessage({
            type: "error",
            text: "Please attach your original medical certificate (PDF or Image) for administrator verification."
          });
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("name", regName);
        formData.append("email", regEmail);
        formData.append("password", regPassword);
        formData.append("role", "doctor");
        formData.append("contactInfo", regPhone);
        formData.append("phone", regPhone);
        formData.append("specialization", regSpecialization);
        formData.append("licenseNumber", regLicenseNumber);
        formData.append("experience", regExperience);
        formData.append("fees", regFees);
        formData.append("bio", regBio);
        formData.append("certificate", regCertificateFile);

        res = await API.post("/api/auth/register", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        res = await API.post("/api/auth/register", {
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          contactInfo: regPhone
        });
      }

      if (res.data.success) {
        if (regRole === "doctor") {
          setMessage({
            type: "success",
            text: "✓ Doctor account created! Your original certification is now awaiting administrator review."
          });
          await login(regEmail, regPassword);
          setTimeout(() => {
            onClose();
          }, 1800);
        } else {
          setMessage({ type: "success", text: "✓ Account registered! Signing you in..." });
          await login(regEmail, regPassword);
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Registration failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = (acc) => {
    quickSwitch(acc);
    setMessage({ type: "success", text: `✓ Switched to ${acc.name} (${acc.role.toUpperCase()})` });
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fade-in 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="cyber-card"
        style={{
          width: "100%",
          maxWidth: 620,
          maxHeight: "92vh",
          overflowY: "auto",
          padding: 28,
          boxShadow: "var(--glow-cyan)",
          border: "1px solid var(--neon-cyan)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: "12px", background: "rgba(102, 252, 241, 0.12)", border: "1px solid var(--neon-cyan)", color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 10, marginBottom: 6 }}>
              <span>🔐 IDENTITY & ACCESS MANAGEMENT</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--text-primary)", margin: 0 }}>
              Sushruta Clinical Authentication
            </h2>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              Sign in with Admin, Doctor, or Patient credentials
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
              borderRadius: "50%",
              width: 30,
              height: 30,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab switchers */}
        <div className="tab-bar" style={{ margin: "0 0 16px" }}>
          <button
            className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
            style={{ padding: "6px 14px", fontSize: 11 }}
          >
            🔑 Sign In
          </button>
          <button
            className={`tab-btn ${activeTab === "quick" ? "active" : ""}`}
            onClick={() => setActiveTab("quick")}
            style={{ padding: "6px 14px", fontSize: 11 }}
          >
            ⚡ Fast Account Switcher
          </button>
          <button
            className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
            style={{ padding: "6px 14px", fontSize: 11 }}
          >
            ➕ Register
          </button>
        </div>

        {/* Notification Message */}
        {message.text && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: 14,
              background: message.type === "success" ? "rgba(0, 255, 135, 0.15)" : "rgba(255, 0, 64, 0.15)",
              border: message.type === "success" ? "1px solid var(--neon-green)" : "1px solid var(--neon-red)",
              borderRadius: "var(--radius)",
              color: message.type === "success" ? "var(--neon-green)" : "var(--neon-red)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Tab 1: Standard Login Form */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                placeholder="e.g. admin@gmail.com or doctor1@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius)",
                  padding: "10px 12px",
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                PASSWORD
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius)",
                  padding: "10px 12px",
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Demo passwords: <code style={{ color: "var(--neon-cyan)" }}>admin123</code>, <code style={{ color: "var(--neon-purple)" }}>doctor123</code>, <code style={{ color: "var(--neon-green)" }}>patient123</code>
              </span>
              <button
                type="submit"
                className="btn-cyber"
                disabled={loading}
                style={{ fontSize: 11, padding: "10px 20px" }}
              >
                <span>{loading ? "AUTHENTICATING..." : "🔑 SIGN IN"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Fast 1-Click Role Switcher */}
        {activeTab === "quick" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
              CHOOSE PRE-CONFIGURED ROLE ACCOUNT:
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8, maxHeight: 280, overflowY: "auto" }}>
              {/* Admin */}
              <div
                onClick={() => handleQuickSwitch({ id: 1, name: "System Admin", email: "admin@gmail.com", role: "admin", contact_info: "999-999-9999" })}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid rgba(255, 0, 64, 0.3)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "var(--transition)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--neon-red)", fontSize: 13 }}>👑 System Admin</strong>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>admin@gmail.com • Role: Administrator</div>
                </div>
                <span className="status-badge" style={{ background: "rgba(255, 0, 64, 0.15)", color: "var(--neon-red)", border: "1px solid var(--neon-red)" }}>
                  SWITCH
                </span>
              </div>

              {/* Doctor: Dr. Jane Hart */}
              <div
                onClick={() => handleQuickSwitch({ id: 4, name: "Dr. Jane Hart, MD", email: "doctor1@gmail.com", role: "doctor", doctor_id: 1 })}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "var(--transition)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--neon-purple)", fontSize: 13 }}>👩‍⚕️ Dr. Jane Hart (Cardiology)</strong>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>doctor1@gmail.com • Role: Attending Doctor</div>
                </div>
                <span className="status-badge" style={{ background: "rgba(138, 43, 226, 0.15)", color: "var(--neon-purple)", border: "1px solid var(--neon-purple)" }}>
                  SWITCH
                </span>
              </div>

              {/* Doctor: Dr. Albert Medic */}
              <div
                onClick={() => handleQuickSwitch({ id: 7, name: "Dr. Albert Medic, MD", email: "doctor4@gmail.com", role: "doctor", doctor_id: 3 })}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "var(--transition)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--neon-purple)", fontSize: 13 }}>👨‍⚕️ Dr. Albert Medic (General Medicine)</strong>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>doctor4@gmail.com • Role: Attending Doctor</div>
                </div>
                <span className="status-badge" style={{ background: "rgba(138, 43, 226, 0.15)", color: "var(--neon-purple)", border: "1px solid var(--neon-purple)" }}>
                  SWITCH
                </span>
              </div>

              {/* Patient: Alex Mercer */}
              <div
                onClick={() => handleQuickSwitch({ id: 2, name: "Alex Mercer", email: "alex.mercer@sushruta-ai.local", role: "patient", contact_info: "+1 555-382-9012" })}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid rgba(102, 252, 241, 0.3)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "var(--transition)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--neon-cyan)", fontSize: 13 }}>👤 Alex Mercer (Primary Patient)</strong>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>alex.mercer@sushruta-ai.local • Role: Patient</div>
                </div>
                <span className="status-badge optimal">
                  SWITCH
                </span>
              </div>

              {/* Patient: John Patient */}
              <div
                onClick={() => handleQuickSwitch({ id: 3, name: "John Patient", email: "patient1@gmail.com", role: "patient", contact_info: "111-111-1111" })}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid rgba(0, 255, 135, 0.3)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "var(--transition)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--neon-green)", fontSize: 13 }}>👤 John Patient</strong>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>patient1@gmail.com • Role: Patient</div>
                </div>
                <span className="status-badge" style={{ background: "rgba(0, 255, 135, 0.15)", color: "var(--neon-green)", border: "1px solid var(--neon-green)" }}>
                  SWITCH
                </span>
              </div>

              {/* Patient: Elena Vasquez */}
              <div
                onClick={() => handleQuickSwitch({ id: 10, name: "Elena Vasquez", email: "elena.vasquez@gmail.com", role: "patient", contact_info: "+1 555-234-8901" })}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "var(--transition)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--neon-purple)", fontSize: 13 }}>👤 Elena Vasquez</strong>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>elena.vasquez@gmail.com • Hashimoto Thyroiditis</div>
                </div>
                <span className="status-badge" style={{ background: "rgba(138, 43, 226, 0.15)", color: "var(--neon-purple)", border: "1px solid var(--neon-purple)" }}>
                  SWITCH
                </span>
              </div>

              {/* Patient: Marcus Sterling */}
              <div
                onClick={() => handleQuickSwitch({ id: 11, name: "Marcus Sterling", email: "marcus.sterling@gmail.com", role: "patient", contact_info: "+1 555-345-6712" })}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid rgba(255, 170, 0, 0.3)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "var(--transition)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--neon-amber)", fontSize: 13 }}>👤 Marcus Sterling</strong>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>marcus.sterling@gmail.com • Type 2 Diabetes</div>
                </div>
                <span className="status-badge" style={{ background: "rgba(255, 170, 0, 0.15)", color: "var(--neon-amber)", border: "1px solid var(--neon-amber)" }}>
                  SWITCH
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Registration */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                  FULL NAME {regRole === "doctor" ? "(PHYSICIAN)" : ""}
                </label>
                <input
                  type="text"
                  required
                  placeholder={regRole === "doctor" ? "e.g. Dr. Arthur Bennett, MD" : "e.g. David Vance"}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "8px 10px", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                  ACCOUNT ROLE
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "8px 10px", color: "var(--text-primary)", fontSize: 12 }}
                >
                  <option value="patient">👤 Patient Account</option>
                  <option value="doctor">🩺 Medical Doctor (Attending)</option>
                  <option value="admin">👑 Administrator</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "8px 10px", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                  PHONE NUMBER
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "8px 10px", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                PASSWORD
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "8px 10px", color: "var(--text-primary)", fontSize: 12 }}
              />
            </div>

            {/* Doctor-Specific Verification & Credentials Section */}
            {regRole === "doctor" && (
              <div
                style={{
                  marginTop: 4,
                  padding: "14px",
                  background: "rgba(102, 252, 241, 0.04)",
                  border: "1px solid rgba(102, 252, 241, 0.25)",
                  borderRadius: "var(--radius)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>🩺</span>
                    <strong style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)" }}>
                      PHYSICIAN CREDENTIALS & BOARD VERIFICATION
                    </strong>
                  </div>
                  <span className="status-badge attention" style={{ fontSize: 9 }}>
                    REQUIRES ADMIN APPROVAL
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                      SPECIALIZATION *
                    </label>
                    <select
                      value={regSpecialization}
                      onChange={(e) => setRegSpecialization(e.target.value)}
                      style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "8px 10px", color: "var(--text-primary)", fontSize: 12 }}
                    >
                      {DOCTOR_SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                      MEDICAL LICENSE / REG. ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MD-98421-NY / MCI-4812"
                      value={regLicenseNumber}
                      onChange={(e) => setRegLicenseNumber(e.target.value)}
                      style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "8px 10px", color: "var(--text-primary)", fontSize: 12 }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                      YEARS OF EXPERIENCE
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={regExperience}
                      onChange={(e) => setRegExperience(e.target.value)}
                      style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "8px 10px", color: "var(--text-primary)", fontSize: 12 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                      CONSULTATION FEE ($)
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="1000"
                      value={regFees}
                      onChange={(e) => setRegFees(e.target.value)}
                      style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "8px 10px", color: "var(--text-primary)", fontSize: 12 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                    CLINICAL BIO / QUALIFICATIONS SUMMARY
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Board Certified Specialist in Cardiovascular Diseases, Fellowship at Mayo Clinic."
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "8px 10px", color: "var(--text-primary)", fontSize: 12, resize: "none" }}
                  />
                </div>

                {/* UPLOAD ORIGINAL DOCTOR CERTIFICATION */}
                <div>
                  <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 4, fontWeight: 700 }}>
                    📄 ORIGINAL DOCTOR CERTIFICATION / MEDICAL LICENSE *
                  </label>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setFileDragActive(true); }}
                    onDragLeave={() => setFileDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setFileDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        setRegCertificateFile(e.dataTransfer.files[0]);
                      }
                    }}
                    style={{
                      border: fileDragActive
                        ? "2px dashed var(--neon-cyan)"
                        : regCertificateFile
                        ? "1px solid var(--neon-green)"
                        : "1px dashed var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "16px",
                      textAlign: "center",
                      background: fileDragActive
                        ? "rgba(102, 252, 241, 0.12)"
                        : regCertificateFile
                        ? "rgba(0, 255, 135, 0.05)"
                        : "var(--bg-input)",
                      cursor: "pointer",
                      transition: "var(--transition)",
                    }}
                    onClick={() => {
                      document.getElementById("doctor-cert-file-input")?.click();
                    }}
                  >
                    <input
                      id="doctor-cert-file-input"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setRegCertificateFile(e.target.files[0]);
                        }
                      }}
                    />

                    {regCertificateFile ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                          <span style={{ fontSize: 24 }}>📜</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--neon-green)" }}>
                              {regCertificateFile.name}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                              {(regCertificateFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRegCertificateFile(null);
                          }}
                          style={{
                            background: "rgba(255, 0, 64, 0.15)",
                            border: "1px solid var(--neon-red)",
                            color: "var(--neon-red)",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 26, marginBottom: 6 }}>📑</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                          Click to browse or drag & drop original certification
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                          Accepted: Medical Board License, Degree, or Council Certificate (PDF, PNG, JPG up to 10MB)
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 6, display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span>ℹ️</span>
                    <span>
                      <strong>Admin Verification:</strong> The Administrator reviews this original document on the Admin Verification Board before activating your public consultation schedule.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="submit"
                className="btn-cyber"
                disabled={loading || !regName || !regEmail || !regPassword || (regRole === "doctor" && (!regCertificateFile || !regLicenseNumber))}
                style={{ fontSize: 11, padding: "10px 22px" }}
              >
                <span>{loading ? "CREATING & UPLOADING..." : regRole === "doctor" ? "📑 SUBMIT FOR VERIFICATION" : "💾 CREATE ACCOUNT"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
