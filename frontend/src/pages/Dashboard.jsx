import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WarningBanner from "../components/WarningBanner";
import ReportCard from "../components/ReportCard";

function Dashboard() {
  const patientVitals = [
    { label: "Resting Heart Rate", value: "72 bpm", status: "Optimal", isAlert: false },
    { label: "Blood Pressure", value: "118 / 78", status: "Normal", isAlert: false },
    { label: "SpO2 (Pulse Oximetry)", value: "99%", status: "Optimal", isAlert: false },
    { label: "Fasting Blood Glucose", value: "106 mg/dL", status: "Borderline", isAlert: true },
  ];

  const reports = [
    {
      title: "Comprehensive Metabolic Panel (CMP)",
      summary: "Electrolytes and kidney function markers are within normal limits. Fasting blood sugar slightly elevated (106 mg/dL).",
      date: "06-10-2026",
      status: "attention",
    },
    {
      title: "Complete Blood Count (CBC) with Differential",
      summary: "Mild microcytic anemia detected. Hemoglobin 11.4 g/dL. Recommended dietary iron evaluation with physician.",
      date: "28-09-2026",
      status: "attention",
    },
    {
      title: "Standard Lipid Profile Panel",
      summary: "Total cholesterol: 185 mg/dL. LDL: 95 mg/dL. HDL: 58 mg/dL. Cardiovascular risk indices within optimal threshold.",
      date: "14-08-2026",
      status: "optimal",
    },
  ];

  return (
    <div className="dashboard-page-root">
      <Navbar />
      <WarningBanner />

      <main className="container dashboard-container">
        {/* Patient Header Banner */}
        <div className="dashboard-welcome-banner glass-panel">
          <div className="welcome-text-block">
            <div className="badge-neon-pill">
              <span className="pulse-beacon-green" />
              <span>CLINICAL PORTAL • GUEST SESSION</span>
            </div>
            <h1 className="welcome-title">Personal Health Records & Triage</h1>
            <p className="welcome-sub">
              Review parsed biomarker records, track longitudinal laboratory changes, and synthesize insights with Sushruta AI.
            </p>
          </div>

          <div className="welcome-actions">
            <Link to="/reports" className="btn-glass">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Upload New Lab</span>
            </Link>
            <Link to="/chat" className="btn-neon-cta">
              <span>Start New Consultation</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Vital Telemetry Strip */}
        <section className="vitals-strip">
          <h2 className="section-mini-heading">Latest Physiological Telemetry</h2>
          <div className="vitals-grid">
            {patientVitals.map((vital, idx) => (
              <div
                key={idx}
                className={`vital-box glass-panel ${vital.isAlert ? "vital-box-alert" : ""}`}
              >
                <div className="vital-header">
                  <span className="vital-label">{vital.label}</span>
                  <span className={vital.isAlert ? "pulse-beacon-red" : "pulse-beacon-green"} style={{ width: 6, height: 6 }} />
                </div>
                <div className="vital-value font-mono">{vital.value}</div>
                <div className={`vital-status-pill font-mono ${vital.isAlert ? "alert-text" : "optimal-text"}`}>
                  {vital.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historical Reports List */}
        <section className="reports-history-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Diagnostic Test History</h2>
              <p className="section-subtitle">
                3 verified lab reports parsed with Sushruta OCR engine.
              </p>
            </div>
          </div>

          <div className="reports-list">
            {reports.map((item, index) => (
              <ReportCard key={index} report={item} />
            ))}
          </div>
        </section>
      </main>

      <style>{`
        .dashboard-page-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-pure);
        }

        .dashboard-container {
          padding-top: 32px;
          padding-bottom: 60px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        .dashboard-welcome-banner {
          padding: 36px 40px;
          border-radius: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.85) 100%);
        }

        .welcome-text-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .welcome-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .welcome-sub {
          font-size: 0.98rem;
          color: var(--text-secondary);
          max-width: 580px;
        }

        .welcome-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .section-mini-heading {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 14px;
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
        }

        .vital-box {
          padding: 20px;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vital-box-alert {
          border-color: rgba(255, 42, 95, 0.28);
          background: rgba(255, 42, 95, 0.03);
        }

        .vital-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .vital-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .vital-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .vital-status-pill {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .optimal-text {
          color: var(--neon-emerald);
        }

        .alert-text {
          color: #dc2626;
        }

        .section-header-row {
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .section-subtitle {
          font-size: 0.92rem;
          color: var(--text-secondary);
        }

        @media (max-width: 900px) {
          .dashboard-welcome-banner {
            flex-direction: column;
            align-items: flex-start;
          }
          .welcome-actions {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;