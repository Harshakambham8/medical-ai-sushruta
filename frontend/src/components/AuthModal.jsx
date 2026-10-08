import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

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
      const res = await API.post("/api/auth/register", {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        contactInfo: regPhone
      });

      if (res.data.success) {
        setMessage({ type: "success", text: "✓ Account registered! Signing you in..." });
        await login(regEmail, regPassword);
        setTimeout(() => {
          onClose();
        }, 1200);
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
          maxWidth: 580,
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
            </div>
          </div>
        )}

        {/* Tab 3: Registration */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginBottom: 4 }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Vance"
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
                  <option value="patient">Patient Account</option>
                  <option value="doctor">Medical Doctor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
              <button
                type="submit"
                className="btn-cyber"
                disabled={loading || !regName || !regEmail || !regPassword}
                style={{ fontSize: 11, padding: "9px 20px" }}
              >
                <span>{loading ? "CREATING..." : "💾 CREATE ACCOUNT"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
