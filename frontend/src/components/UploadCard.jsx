import React, { useState } from "react";
import API from "../services/api";

function UploadCard({ onReportParsed }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile);
    setErrorMsg("");
    setParseResult(null);
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await API.post("/reports/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setParseResult(response.data);
      if (onReportParsed) {
        onReportParsed(response.data);
      }
    } catch (err) {
      console.error("Report extraction error:", err);
      setErrorMsg("Failed to extract report data. Please ensure it is a valid PDF report and server is running.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-card-root glass-panel">
      <div
        className={`upload-dropzone ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="dropzone-icon-shell">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <h3 className="dropzone-title">Upload Clinical Lab Report</h3>
        <p className="dropzone-desc">
          Drag and drop your pathology report, CBC, lipid panel, or metabolic test PDF.
        </p>

        <label className="btn-glass select-file-label">
          <span>Choose File</span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
              }
            }}
            style={{ display: "none" }}
          />
        </label>

        {file && (
          <div className="selected-file-badge font-mono">
            <span className="pulse-beacon-green" />
            <span>Ready: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </div>

      {file && (
        <div className="upload-action-row">
          <button
            onClick={handleUploadAndAnalyze}
            disabled={uploading}
            className="btn-neon-cta analyze-btn"
          >
            {uploading ? (
              <>
                <span className="pulse-beacon-green" />
                <span>Extracting Biomarkers...</span>
              </>
            ) : (
              <>
                <span>Extract & Analyze Report</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="alert-neon-red" style={{ marginTop: 16 }}>
          <span className="pulse-beacon-red" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Parse Result Preview */}
      {parseResult && (
        <div className="parse-result-box glass-card-elevated">
          <div className="result-header">
            <div className="badge-neon-pill">
              <span className="pulse-beacon-green" />
              <span>EXTRACTION COMPLETED</span>
            </div>
            <span className="font-mono result-filename">{parseResult.filename}</span>
          </div>

          <div className="result-content-preview font-mono">
            {parseResult.content || "Report parsed successfully. No text content extracted from this document."}
          </div>
        </div>
      )}

      <style>{`
        .upload-card-root {
          padding: 32px;
          border-radius: 24px;
        }

        .upload-dropzone {
          border: 2px dashed rgba(0, 102, 255, 0.25);
          background: rgba(248, 250, 252, 0.7);
          border-radius: 20px;
          padding: 48px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          transition: var(--transition-smooth);
        }

        .upload-dropzone.drag-active {
          border-color: var(--neon-cyan);
          background: rgba(224, 242, 254, 0.5);
          box-shadow: 0 0 25px rgba(0, 102, 255, 0.2);
        }

        .dropzone-icon-shell {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(0, 229, 153, 0.12) 100%);
          border: 1px solid rgba(0, 102, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--neon-blue);
        }

        .dropzone-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .dropzone-desc {
          font-size: 0.94rem;
          color: var(--text-secondary);
          max-width: 440px;
          line-height: 1.5;
        }

        .select-file-label {
          margin-top: 6px;
        }

        .selected-file-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid rgba(0, 229, 153, 0.4);
          padding: 8px 16px;
          border-radius: 9999px;
          font-size: 0.82rem;
          color: var(--text-primary);
          box-shadow: 0 4px 14px rgba(0, 229, 153, 0.15);
        }

        .upload-action-row {
          margin-top: 20px;
          display: flex;
          justify-content: center;
        }

        .analyze-btn {
          padding: 14px 34px;
          font-size: 0.96rem;
        }

        .parse-result-box {
          margin-top: 28px;
          padding: 24px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid rgba(0, 102, 255, 0.2);
        }

        .result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .result-filename {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .result-content-preview {
          background: #f8fafc;
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 18px;
          font-size: 0.82rem;
          color: var(--text-primary);
          max-height: 280px;
          overflow-y: auto;
          white-space: pre-wrap;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default UploadCard;