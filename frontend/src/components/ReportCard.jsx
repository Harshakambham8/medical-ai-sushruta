import React from "react";
import { Link } from "react-router-dom";

function ReportCard({ report }) {
  const isAlert = report.status === "attention" || report.summary.toLowerCase().includes("anemia") || report.summary.toLowerCase().includes("elevated");

  return (
    <div className={`report-card-root glass-panel ${isAlert ? "card-alert-border" : ""}`}>
      <div className="report-card-top">
        <div className="report-title-group">
          <div className="report-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h3 className="report-card-title">{report.title}</h3>
            <span className="report-date font-mono">{report.date}</span>
          </div>
        </div>

        <div className={`status-pill font-mono ${isAlert ? "pill-alert" : "pill-optimal"}`}>
          <span className={isAlert ? "pulse-beacon-red" : "pulse-beacon-green"} style={{ width: 6, height: 6 }} />
          <span>{isAlert ? "Clinical Attention" : "Optimal Range"}</span>
        </div>
      </div>

      <p className="report-summary-text">{report.summary}</p>

      <div className="report-card-bottom">
        <Link
          to={`/chat?query=${encodeURIComponent(`Can you explain my recent ${report.title} where summary indicates: ${report.summary}`)}`}
          className="btn-glass ask-ai-btn"
        >
          <span>Ask Sushruta About This Report</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <style>{`
        .report-card-root {
          padding: 24px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
          background: rgba(255, 255, 255, 0.9);
        }

        .card-alert-border {
          border-color: rgba(255, 42, 95, 0.25);
          box-shadow: 0 8px 24px rgba(255, 42, 95, 0.06);
        }

        .report-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .report-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .report-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(0, 102, 255, 0.08);
          border: 1px solid rgba(0, 102, 255, 0.15);
          color: var(--neon-blue);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .report-card-title {
          font-size: 1.12rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .report-date {
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 9999px;
          text-transform: uppercase;
        }

        .pill-optimal {
          background: rgba(240, 253, 244, 0.9);
          border: 1px solid rgba(0, 229, 153, 0.3);
          color: var(--neon-emerald);
        }

        .pill-alert {
          background: rgba(255, 42, 95, 0.08);
          border: 1px solid rgba(255, 42, 95, 0.3);
          color: #dc2626;
        }

        .report-summary-text {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }

        .report-card-bottom {
          display: flex;
          justify-content: flex-end;
          padding-top: 10px;
          border-top: 1px solid var(--border-subtle);
        }

        .ask-ai-btn {
          font-size: 0.84rem;
          padding: 8px 18px;
        }

        @media (max-width: 640px) {
          .report-card-top {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default ReportCard;