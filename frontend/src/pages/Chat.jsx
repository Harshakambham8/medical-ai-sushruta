import React from "react";
import Navbar from "../components/Navbar";
import WarningBanner from "../components/WarningBanner";
import ChatBox from "../components/ChatBox";

function Chat() {
  return (
    <div className="chat-page-root">
      <Navbar />
      <WarningBanner />

      <main className="container chat-layout-container">
        {/* Clinical Context Sidebar */}
        <aside className="chat-sidebar">
          {/* Patient Session Panel */}
          <div className="glass-panel sidebar-card">
            <div className="sidebar-header">
              <span className="pulse-beacon-green" />
              <span className="font-mono card-label">ACTIVE CLINICAL SESSION</span>
            </div>
            <div className="session-patient-name">Patient: Self-Assessment</div>
            <div className="session-status font-mono">ENCRYPTION: 256-BIT • ANONYMIZED</div>

            <div className="telemetry-mini-grid">
              <div className="mini-telemetry-box">
                <span className="mini-title">SESSION ID</span>
                <span className="mini-val font-mono">#SSH-9842</span>
              </div>
              <div className="mini-telemetry-box">
                <span className="mini-title">TRIAGE LEVEL</span>
                <span className="mini-val font-mono" style={{ color: "#00e599" }}>PRIMARY</span>
              </div>
            </div>
          </div>

          {/* Emergency Triage Quick Protocol - Subtle Neon Red Alert */}
          <div className="glass-panel sidebar-card alert-sidebar-panel">
            <div className="alert-header">
              <span className="pulse-beacon-red" />
              <span className="font-mono alert-label">EMERGENCY PROTOCOL</span>
            </div>
            <p className="alert-desc">
              If experiencing chest pressure radiating to the arm, sudden facial numbness, or severe difficulty breathing, immediately contact emergency services.
            </p>
            <a href="tel:911" className="emergency-call-btn">
              <span>Emergency Direct: 911 / 112</span>
            </a>
          </div>

          {/* Clinical Guardrails Info */}
          <div className="glass-panel sidebar-card">
            <h4 className="guardrails-title">Sushruta Triage Guardrails</h4>
            <ul className="guardrails-list">
              <li>
                <span className="bullet-glow">•</span>
                <span>Contextual symptom synthesis via Gemini 2.5 Flash</span>
              </li>
              <li>
                <span className="bullet-glow">•</span>
                <span>Plain-language medical terminology translation</span>
              </li>
              <li>
                <span className="bullet-glow">•</span>
                <span>Evidence-supported reference summaries</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Conversation Area */}
        <section className="chat-main-section">
          <ChatBox />
        </section>
      </main>

      <style>{`
        .chat-page-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-pure);
        }

        .chat-layout-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 28px;
          padding-top: 24px;
          padding-bottom: 40px;
          flex: 1;
        }

        .chat-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sidebar-card {
          padding: 22px;
          border-radius: 20px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .card-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--neon-emerald);
          letter-spacing: 0.05em;
        }

        .session-patient-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .session-status {
          font-size: 0.7rem;
          color: var(--neon-blue);
          margin-bottom: 16px;
        }

        .telemetry-mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 14px;
        }

        .mini-telemetry-box {
          display: flex;
          flex-direction: column;
          background: rgba(248, 250, 252, 0.8);
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid var(--border-subtle);
        }

        .mini-title {
          font-size: 0.66rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .mini-val {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Emergency Alert Panel */
        .alert-sidebar-panel {
          background: rgba(255, 42, 95, 0.04);
          border: 1px solid rgba(255, 42, 95, 0.22);
          box-shadow: 0 4px 18px rgba(255, 42, 95, 0.08);
        }

        .alert-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .alert-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--neon-red);
          letter-spacing: 0.06em;
        }

        .alert-desc {
          font-size: 0.82rem;
          color: #991b1b;
          line-height: 1.5;
          margin-bottom: 14px;
        }

        .emergency-call-btn {
          display: block;
          text-align: center;
          background: #ffffff;
          border: 1px solid rgba(255, 42, 95, 0.35);
          color: #dc2626;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 8px 12px;
          border-radius: 8px;
          text-decoration: none;
          transition: var(--transition-smooth);
        }

        .emergency-call-btn:hover {
          background: #ef4444;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        }

        /* Guardrails Info */
        .guardrails-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .guardrails-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .guardrails-list li {
          font-size: 0.82rem;
          color: var(--text-secondary);
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.45;
        }

        .bullet-glow {
          color: var(--neon-cyan);
          font-size: 1.2rem;
          line-height: 1;
        }

        .chat-main-section {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 900px) {
          .chat-layout-container {
            grid-template-columns: 1fr;
          }
          .chat-sidebar {
            order: 2;
          }
        }
      `}</style>
    </div>
  );
}

export default Chat;