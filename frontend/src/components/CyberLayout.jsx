import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const ALL_NAV_ITEMS = [
  { path: "/dashboard", label: "Patient Dashboard", icon: "🎛️", roles: ["patient", "admin"] },
  { path: "/chat", label: "AI Health Chatbot", icon: "💬", roles: ["patient", "admin"] },
  { path: "/book-doctor", label: "Book a Doctor", icon: "👨‍⚕️", roles: ["doctor", "patient", "admin"] },
  { path: "/report-analyzer", label: "Report Analyzer", icon: "📊", roles: ["doctor", "patient", "admin"] },
  { path: "/symptom-guidance", label: "Symptom Guide", icon: "🩺", roles: ["doctor", "patient", "admin"] },
  { path: "/history", label: "History Log", icon: "📁", roles: ["patient", "admin"] },
];

const PAGE_TITLES = {
  "/dashboard": "PATIENT CLINICAL DASHBOARD",
  "/chat": "AI HEALTH CHATBOT",
  "/report-analyzer": "REPORT ANALYZER",
  "/symptom-guidance": "SYMPTOM GUIDANCE",
  "/book-doctor": "BOOK A DOCTOR & e-SCHEDULING",
  "/history": "SESSION HISTORY & ACCOUNTANT LEDGER",
  "/admin/doctor-verification": "DOCTOR VERIFICATION & ACCEPTING REGISTRY",
  "/admin/activities": "DOCTOR & PATIENT ACTIVITY AUDIT STREAM",
  "/admin/bookings": "PATIENT BOOKINGS & DOCTOR CONFIRMATIONS",
};

export default function CyberLayout({ children }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const currentRole = user?.role ? user.role.toLowerCase() : "patient";

  // Role-Specific Navigation Links
  // 1. Admin: Doctor Verification, Actions of Doctors & Patients, Bookings & Confirmations, History & Accountant
  // 2. Doctor: Book a Doctor, Report Analyzer, Symptom Guide
  // 3. Patient: Patient Dashboard, AI Health Chatbot, Report Analyzer, Symptom Guide, Book a Doctor, History Log
  let navItems = [];
  if (currentRole === "admin") {
    navItems = [
      { path: "/admin/doctor-verification", label: "Doctor Verification", icon: "🩺" },
      { path: "/admin/activities", label: "Doctor & Patient Actions", icon: "⚡" },
      { path: "/admin/bookings", label: "Bookings & Confirmations", icon: "📅" },
      { path: "/history", label: "History & Accountant", icon: "💰" },
    ];
  } else if (currentRole === "doctor") {
    navItems = [
      { path: "/book-doctor", label: "Book a Doctor & Schedule", icon: "👨‍⚕️" },
      { path: "/report-analyzer", label: "Report Analyzer", icon: "📊" },
      { path: "/symptom-guidance", label: "Symptom Guide", icon: "🩺" },
    ];
  } else {
    // Patient (default)
    navItems = [
      { path: "/dashboard", label: "Patient Dashboard", icon: "🎛️" },
      { path: "/chat", label: "AI Health Chatbot", icon: "💬" },
      { path: "/report-analyzer", label: "Report Analyzer", icon: "📊" },
      { path: "/symptom-guidance", label: "Symptom Guide", icon: "🩺" },
      { path: "/book-doctor", label: "Book a Doctor", icon: "👨‍⚕️" },
      { path: "/history", label: "History Log", icon: "📁" },
    ];
  }

  // Automatic Route Protection & Redirections based on role
  useEffect(() => {
    if (currentRole === "admin") {
      const allowedAdminPaths = [
        "/admin/doctor-verification",
        "/admin/activities",
        "/admin/bookings",
        "/history",
      ];
      if (!allowedAdminPaths.includes(location.pathname)) {
        navigate("/admin/doctor-verification", { replace: true });
      }
    } else if (currentRole === "doctor") {
      const allowedDoctorPaths = ["/book-doctor", "/report-analyzer", "/symptom-guidance"];
      if (!allowedDoctorPaths.includes(location.pathname)) {
        navigate("/book-doctor", { replace: true });
      }
    }
  }, [currentRole, location.pathname, navigate]);

  const pageTitle = PAGE_TITLES[location.pathname] || "SUSHRUTA MEDICAL AI";

  return (
    <div className="cyber-shell">
      {/* Sidebar */}
      <aside className={`cyber-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-mark">
            ⚕ Sushruta
            <span className="brand-sub">Medical AI Engine</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer with Account Auth & Theme Switcher */}
        <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 12px" }}>
          {/* User Account / Login Status Card */}
          <div
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius)",
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                <span style={{ fontSize: 16 }}>
                  {user?.role === "admin" ? "👑" : user?.role === "doctor" ? "👩‍⚕️" : "👤"}
                </span>
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user ? user.name : "Guest"}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Role: <span style={{ color: user?.role === "admin" ? "var(--neon-red)" : user?.role === "doctor" ? "var(--neon-purple)" : "var(--neon-cyan)", fontWeight: 700 }}>
                      {user?.role || "GUEST"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setAuthModalOpen(true)}
                title="Switch Account (Admin / Doctor / Patient)"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-default)",
                  color: "var(--neon-cyan)",
                  borderRadius: "4px",
                  padding: "3px 6px",
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                }}
              >
                SWITCH
              </button>
            </div>

            {/* Login / Logout Action Button */}
            <div style={{ display: "flex", gap: 6 }}>
              {user ? (
                <button
                  onClick={logout}
                  style={{
                    width: "100%",
                    background: "rgba(255, 0, 64, 0.12)",
                    border: "1px solid rgba(255, 0, 64, 0.3)",
                    color: "var(--neon-red)",
                    borderRadius: "var(--radius)",
                    padding: "6px 10px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <span>🚪 LOGOUT</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  style={{
                    width: "100%",
                    background: "rgba(102, 252, 241, 0.12)",
                    border: "1px solid var(--neon-cyan)",
                    color: "var(--neon-cyan)",
                    borderRadius: "var(--radius)",
                    padding: "6px 10px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <span>🔑 LOGIN / SIGN IN</span>
                </button>
              )}
            </div>
          </div>

          {/* Light / Dark Mode Switch Button */}
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {isDark ? "☀️" : "🌙"}{" "}
            {isDark ? "Switch to Light Mode" : "Switch to Cyber Dark"}
          </button>
        </div>
      </aside>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Main Content */}
      <main className="cyber-main">
        <header className="cyber-topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <span className="topbar-title">{pageTitle}</span>
          <div className="topbar-status">
            <span className="pulse-dot"></span>
            SYSTEM ONLINE • TELEMETRY ACTIVE
          </div>
        </header>

        <div className="cyber-content">{children}</div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 45,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
