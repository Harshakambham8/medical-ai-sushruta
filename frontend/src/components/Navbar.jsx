import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Overview" },
    { to: "/chat", label: "AI Consultation" },
    { to: "/reports", label: "Report Parser" },
    { to: "/dashboard", label: "Clinical Records" },
  ];

  return (
    <header className="navbar-root">
      <div className="container navbar-container">
        {/* Brand Identity */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-shell">
            <svg
              className="brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Medical cross with dynamic pulse line */}
              <path d="M12 2v20M2 12h20" stroke="url(#navIconGrad)" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="9" stroke="url(#navIconGrad)" strokeWidth="1.5" strokeDasharray="4 2" />
              <defs>
                <linearGradient id="navIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0066ff" />
                  <stop offset="50%" stopColor="#00d2ff" />
                  <stop offset="100%" stopColor="#00e599" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-text-block">
            <span className="brand-title">SUSHRUTA</span>
            <span className="brand-subtitle">MEDICAL AI</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-links">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link-item ${isActive ? "active" : ""}`}
              >
                {item.label}
                {isActive && <span className="nav-active-pill" />}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & System Status */}
        <div className="navbar-actions">
          <div className="system-status-indicator">
            <span className="pulse-beacon-green" />
            <span className="status-text font-mono">v2.5 • ONLINE</span>
          </div>

          <Link to="/chat" className="btn-neon-cta nav-cta-btn">
            <span>Consult AI</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        .navbar-root {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          transition: all 0.3s ease;
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 76px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .brand-logo-shell {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(0, 102, 255, 0.08) 0%, rgba(0, 229, 153, 0.12) 100%);
          border: 1px solid rgba(0, 102, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 102, 255, 0.1);
          transition: var(--transition-smooth);
        }

        .navbar-brand:hover .brand-logo-shell {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(0, 102, 255, 0.3), 0 0 20px rgba(0, 229, 153, 0.3);
        }

        .brand-icon {
          width: 24px;
          height: 24px;
        }

        .brand-text-block {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .brand-subtitle {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--neon-blue);
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link-item {
          position: relative;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.92rem;
          text-decoration: none;
          transition: var(--transition-smooth);
          padding: 8px 0;
        }

        .nav-link-item:hover {
          color: var(--neon-blue);
        }

        .nav-link-item.active {
          color: var(--neon-blue);
          font-weight: 600;
        }

        .nav-active-pill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2.5px;
          border-radius: 9999px;
          background: var(--grad-neon-cta);
          box-shadow: 0 0 8px rgba(0, 102, 255, 0.6);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .system-status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(240, 253, 244, 0.8);
          border: 1px solid rgba(0, 229, 153, 0.3);
          padding: 6px 14px;
          border-radius: 9999px;
        }

        .status-text {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--neon-emerald);
          letter-spacing: 0.04em;
        }

        .nav-cta-btn {
          padding: 10px 22px;
          font-size: 0.88rem;
        }

        @media (max-width: 900px) {
          .navbar-links {
            display: none;
          }
          .system-status-indicator {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

export default Navbar;