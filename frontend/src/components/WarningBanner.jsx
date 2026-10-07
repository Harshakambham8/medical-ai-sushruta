import React, { useState } from "react";

function WarningBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="warning-banner-wrapper">
      <div className="container">
        <div className="alert-neon-red warning-banner-body">
          <div className="alert-indicator-group">
            <span className="pulse-beacon-red" />
            <span className="alert-badge font-mono">CLINICAL TRIAGE ADVISORY</span>
          </div>

          <p className="warning-text">
            <strong>Educational Guidance Protocol:</strong> Medical AI Sushruta is an intelligent cognitive assistant engineered for educational clinical triage and report comprehension. It does not replace emergency clinical diagnosis. If experiencing acute distress, call emergency services immediately.
          </p>

          <button
            onClick={() => setVisible(false)}
            className="warning-dismiss-btn"
            title="Acknowledge advisory"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .warning-banner-wrapper {
          padding-top: 12px;
          padding-bottom: 4px;
        }

        .warning-banner-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: rgba(255, 42, 95, 0.04);
          border: 1px solid rgba(255, 42, 95, 0.22);
          box-shadow: 0 4px 18px rgba(255, 42, 95, 0.08);
          border-radius: 14px;
          padding: 10px 18px;
        }

        .alert-indicator-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .warning-text {
          font-size: 0.84rem;
          color: #991b1b;
          line-height: 1.45;
          flex: 1;
        }

        .warning-dismiss-btn {
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 8px;
          transition: var(--transition-smooth);
        }

        .warning-dismiss-btn:hover {
          background: rgba(255, 42, 95, 0.12);
          color: #dc2626;
        }

        @media (max-width: 768px) {
          .warning-banner-body {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .warning-dismiss-btn {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

export default WarningBanner;