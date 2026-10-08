import React, { useState, useRef } from "react";
import API from "../services/api";

export default function ReportAnalyzerView() {
  const [dragActive, setDragActive] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("text"); // "text" or "file"
  const fileRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer?.files;
    if (files?.length > 0) handleFileUpload(files[0]);
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("report", file);

    try {
      const res = await API.post("/api/analyze-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setResult({
        status: "critical",
        summary:
          "⚠ Failed to connect to server. Please ensure backend is running.",
        biomarkers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await API.post("/api/analyze-report", {
        text: textInput,
        filename: "Manual_Entry_Report.txt",
      });
      setResult(res.data);
    } catch (err) {
      setResult({
        status: "critical",
        summary: "⚠ Connection error. Backend may be offline.",
        biomarkers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("optimal") || s.includes("normal")) return "bio-status-optimal";
    if (s.includes("elevated") || s.includes("borderline") || s.includes("low") || s.includes("attention"))
      return "bio-status-elevated";
    if (s.includes("critical")) return "bio-status-critical";
    return "bio-status-optimal";
  };

  return (
    <div>
      <h1 className="section-title">📊 Medical Report Analyzer</h1>
      <p className="section-subtitle">
        Upload a medical report or paste lab values to receive an AI-powered
        educational breakdown of biomarkers and health indicators.
      </p>

      {/* Mode Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${mode === "text" ? "active" : ""}`}
          onClick={() => setMode("text")}
        >
          ✏ Paste Text
        </button>
        <button
          className={`tab-btn ${mode === "file" ? "active" : ""}`}
          onClick={() => setMode("file")}
        >
          📄 Upload File
        </button>
      </div>

      {/* Text Mode */}
      {mode === "text" && (
        <div className="cyber-card" style={{ marginBottom: 24 }}>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste lab report text here... e.g.&#10;&#10;Glucose: 106 mg/dL (High)&#10;Creatinine: 0.9 mg/dL&#10;Hemoglobin: 11.2 g/dL (Low)&#10;WBC: 7.2 x10^3/uL"
            style={{
              width: "100%",
              minHeight: 160,
              background: "var(--bg-input)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius)",
              padding: "16px",
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              resize: "vertical",
              lineHeight: 1.7,
            }}
          />
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button
              className="btn-cyber"
              onClick={handleTextAnalysis}
              disabled={!textInput.trim() || loading}
            >
              <span>⚡ ANALYZE REPORT</span>
            </button>
            {textInput && (
              <button
                className="btn-cyber purple"
                onClick={() => { setTextInput(""); setResult(null); }}
              >
                <span>✕ CLEAR</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* File Mode */}
      {mode === "file" && (
        <div
          className={`drop-zone ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.csv,.png,.jpg,.jpeg"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />
          <div className="drop-icon">📤</div>
          <div className="drop-text">
            Drag & drop your medical report here
          </div>
          <div className="drop-hint">
            Supported: PDF, TXT, CSV, PNG, JPG • Max 10MB
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div className="cyber-spinner" style={{ margin: "0 auto 16px" }}></div>
          <div style={{ color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            Analyzing biomarkers...
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="report-result">
          <div className="cyber-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 14, letterSpacing: 1.5, color: "var(--text-primary)" }}>
                ANALYSIS RESULTS
              </h2>
              <span className={`status-badge ${result.status || "optimal"}`}>
                {result.status === "attention" ? "⚠ ATTENTION" : "✓ OPTIMAL"}
              </span>
            </div>

            <div className="hud-line"></div>

            <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: 20 }}>
              {result.summary}
            </p>

            {result.biomarkers && result.biomarkers.length > 0 && (
              <>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: 1, color: "var(--neon-cyan)", marginBottom: 12 }}>
                  DETECTED BIOMARKERS
                </h3>
                <div className="biomarker-grid">
                  {result.biomarkers.map((bio, i) => (
                    <div key={i} className="biomarker-item">
                      <div>
                        <div className="bio-name">{bio.name}</div>
                        <div className="bio-ref">Ref: {bio.ref}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className={`bio-value ${getStatusClass(bio.status)}`}>
                          {bio.value}
                        </div>
                        <div className={`bio-ref ${getStatusClass(bio.status)}`}>
                          {bio.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
