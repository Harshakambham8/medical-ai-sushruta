import React, { useState } from "react";
import Navbar from "../components/Navbar";
import WarningBanner from "../components/WarningBanner";
import UploadCard from "../components/UploadCard";

function Reports() {
  const [lastParsed, setLastParsed] = useState(null);

  return (
    <div className="reports-page-root">
      <Navbar />
      <WarningBanner />

      <main className="container reports-container">
        <div className="reports-header-block">
          <div className="badge-neon-pill">
            <span className="pulse-beacon-green" />
            <span>OCR BIOMARKER INGESTION ENGINE</span>
          </div>
          <h1 className="reports-title">
            Automated Diagnostic Report Understanding
          </h1>
          <p className="reports-subtitle">
            Upload blood work, pathology reports, metabolic panels, and imaging summaries. Sushruta translates dense clinical laboratory ranges into straightforward educational context.
          </p>
        </div>

        <div className="reports-grid">
          {/* Main Upload Zone */}
          <div className="upload-column">
            <UploadCard onReportParsed={setLastParsed} />
          </div>

          {/* Diagnostic Parsing Guidelines Sidebar */}
          <aside className="guidelines-column">
            <div className="glass-panel info-card">
              <h3 className="info-card-title">Supported Diagnostic Formats</h3>
              <div className="format-pills">
                <span className="format-pill font-mono">PDF Documents</span>
                <span className="format-pill font-mono">Complete Blood Count (CBC)</span>
                <span className="format-pill font-mono">Comprehensive Metabolic (CMP)</span>
                <span className="format-pill font-mono">Lipid Profile Panels</span>
                <span className="format-pill font-mono">Thyroid (TSH, T3, T4)</span>
              </div>
            </div>

            <div className="glass-panel info-card alert-info-card">
              <div className="alert-head">
                <span className="pulse-beacon-red" />
                <span className="font-mono alert-title-tag">DATA PRIVACY ASSURANCE</span>
              </div>
              <p className="alert-text">
                All document uploads are processed in volatile memory. No personal identifiable patient information (PHI) is permanently logged or utilized to train commercial models.
              </p>
            </div>

            <div className="glass-panel info-card">
              <h3 className="info-card-title">How Sushruta Parses Reports</h3>
              <ol className="parsing-steps">
                <li>
                  <strong>Optical Text Extraction:</strong> Reads numerical biomarker values and reference intervals.
                </li>
                <li>
                  <strong>Out-of-Range Identification:</strong> Highlights values deviating from laboratory standards.
                </li>
                <li>
                  <strong>Educational Synthesis:</strong> Generates questions you can ask your primary physician.
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        .reports-page-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-pure);
        }

        .reports-container {
          padding-top: 36px;
          padding-bottom: 60px;
          flex: 1;
        }

        .reports-header-block {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 40px auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .reports-title {
          font-size: 2.6rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .reports-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 32px;
          align-items: flex-start;
        }

        .guidelines-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-card {
          padding: 24px;
          border-radius: 20px;
        }

        .info-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 14px;
        }

        .format-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .format-pill {
          background: rgba(240, 249, 255, 0.8);
          border: 1px solid rgba(0, 102, 255, 0.2);
          color: var(--neon-blue);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
        }

        .alert-info-card {
          background: rgba(255, 42, 95, 0.04);
          border: 1px solid rgba(255, 42, 95, 0.22);
        }

        .alert-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .alert-title-tag {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--neon-red);
          letter-spacing: 0.06em;
        }

        .alert-text {
          font-size: 0.84rem;
          color: #991b1b;
          line-height: 1.5;
        }

        .parsing-steps {
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 0.86rem;
          color: var(--text-secondary);
        }

        .parsing-steps li strong {
          color: var(--text-primary);
        }

        @media (max-width: 900px) {
          .reports-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Reports;