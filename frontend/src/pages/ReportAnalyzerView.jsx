import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const SAMPLE_REPORTS = [
  {
    title: "🍬 Diabetic & Metabolic Panel",
    filename: "Diabetic_Metabolic_Screen.txt",
    text: `CLINICAL LABORATORY REPORT - METABOLIC PANEL
Patient: Alex Mercer | Age: 34 | Gender: Male
Specimen: Fasting Venous Blood (12hr Fast)

Fasting Blood Glucose: 142 mg/dL (Reference: 70.0 - 99.0 mg/dL) [HIGH]
Hemoglobin A1c (HbA1c): 7.4 % (Reference: 4.0 - 5.6 %) [ELEVATED]
Serum Insulin: 18.2 uIU/mL (Reference: 2.6 - 24.9 uIU/mL) [NORMAL]
Serum Creatinine: 1.05 mg/dL (Reference: 0.70 - 1.30 mg/dL) [OPTIMAL]
eGFR: 92 mL/min (Reference: > 60 mL/min) [NORMAL]
hs-CRP: 2.8 mg/L (Reference: < 1.0 mg/L) [ELEVATED]`
  },
  {
    title: "🩸 Complete Blood Count (CBC)",
    filename: "Complete_Blood_Count.txt",
    text: `HAEMATOLOGY INVESTIGATION REPORT
Test Panel: Complete Blood Count (CBC) with Differential

White Blood Cell (WBC): 12.8 x10^3/uL (Reference: 4.5 - 11.0 x10^3/uL) [HIGH]
Hemoglobin: 10.4 g/dL (Reference: 13.5 - 17.5 g/dL) [LOW]
Hematocrit (HCT): 31.8 % (Reference: 38.8 - 50.0 %) [LOW]
Platelets: 245 x10^3/uL (Reference: 150 - 450 x10^3/uL) [OPTIMAL]
Serum Ferritin: 14 ng/mL (Reference: 20 - 250 ng/mL) [LOW]
ESR (Erythrocyte Sedimentation): 28 mm/hr (Reference: 0 - 15 mm/hr) [ELEVATED]`
  },
  {
    title: "🫀 Lipid & Cardiovascular Panel",
    filename: "Lipid_Cardio_Risk.txt",
    text: `CARDIOVASCULAR RISK & LIPID PANEL
Specimen: Serum Fasting 14hr

Total Cholesterol: 248 mg/dL (Reference: < 200 mg/dL) [HIGH]
Triglycerides: 215 mg/dL (Reference: < 150 mg/dL) [HIGH]
HDL Cholesterol: 38 mg/dL (Reference: > 40 mg/dL) [LOW]
LDL Cholesterol: 167 mg/dL (Reference: < 100 mg/dL) [HIGH]
VLDL Cholesterol: 43 mg/dL (Reference: 5 - 30 mg/dL) [HIGH]
hs-CRP (Cardiac): 3.4 mg/L (Reference: < 1.0 mg/L) [HIGH RISK]`
  },
  {
    title: "🧪 Comprehensive Metabolic Panel",
    filename: "Comprehensive_Metabolic_Panel.txt",
    text: `COMPREHENSIVE METABOLIC PANEL (CMP-14)
Fasting State: Yes

Serum Creatinine: 1.82 mg/dL (Reference: 0.70 - 1.30 mg/dL) [ELEVATED]
Blood Urea Nitrogen (BUN): 29 mg/dL (Reference: 7 - 20 mg/dL) [ELEVATED]
eGFR: 48 mL/min (Reference: > 60 mL/min) [REDUCED]
Serum Potassium: 5.4 mEq/L (Reference: 3.5 - 5.0 mEq/L) [ELEVATED]
Serum Sodium: 139 mEq/L (Reference: 135 - 145 mEq/L) [OPTIMAL]
ALT (SGPT): 58 U/L (Reference: 7 - 56 U/L) [SLIGHT ELEVATION]
AST (SGOT): 42 U/L (Reference: 10 - 40 U/L) [SLIGHT ELEVATION]`
  }
];

export default function ReportAnalyzerView() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("text"); // "text" | "file" | "history"
  const [recentReports, setRecentReports] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fileRef = useRef(null);

  // Groq API Key Configuration State
  const [showGroqModal, setShowGroqModal] = useState(false);
  const [groqKeyInput, setGroqKeyInput] = useState(() => localStorage.getItem("user_groq_api_key") || "");
  const [groqStatusMsg, setGroqStatusMsg] = useState("");
  const [testingGroq, setTestingGroq] = useState(false);

  // Fetch past reports history
  const fetchReportHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await API.get("/api/reports?limit=10");
      setRecentReports(res.data.data || []);
    } catch (err) {
      console.warn("Could not load report history:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchReportHistory();
  }, []);

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
    if (groqKeyInput.trim()) {
      formData.append("groqApiKey", groqKeyInput.trim());
    }

    try {
      const headers = { "Content-Type": "multipart/form-data" };
      if (groqKeyInput.trim()) {
        headers["x-groq-api-key"] = groqKeyInput.trim();
      }

      const res = await API.post("/api/analyze-report", formData, { headers });
      setResult(res.data);
      fetchReportHistory();
    } catch (err) {
      setResult({
        status: "critical",
        summary: "⚠ Failed to connect to server. Please ensure backend is running.",
        biomarkers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTextAnalysis = async (customText = null, customFilename = null) => {
    const textToAnalyze = customText || textInput;
    if (!textToAnalyze.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const headers = {};
      if (groqKeyInput.trim()) {
        headers["x-groq-api-key"] = groqKeyInput.trim();
      }

      const res = await API.post(
        "/api/analyze-report",
        {
          text: textToAnalyze,
          filename: customFilename || "Clinical_Report_Entry.txt",
          groqApiKey: groqKeyInput.trim() || undefined
        },
        { headers }
      );
      setResult(res.data);
      fetchReportHistory();
    } catch (err) {
      setResult({
        status: "critical",
        summary: "⚠ Connection error. Backend server may be offline or unreachable.",
        biomarkers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGroqKey = () => {
    const trimmed = groqKeyInput.trim();
    if (trimmed) {
      localStorage.setItem("user_groq_api_key", trimmed);
      setGroqStatusMsg("✓ Groq API Key saved for active diagnostic sessions.");
    } else {
      localStorage.removeItem("user_groq_api_key");
      setGroqStatusMsg("✓ Groq API Key removed. System default will be used.");
    }
    setTimeout(() => {
      setGroqStatusMsg("");
      setShowGroqModal(false);
    }, 1200);
  };

  const handleTestGroqKey = async () => {
    if (!groqKeyInput.trim()) {
      setGroqStatusMsg("Please enter an API Key starting with 'gsk_'");
      return;
    }
    setTestingGroq(true);
    setGroqStatusMsg("");
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${groqKeyInput.trim()}` }
      });
      if (res.ok) {
        setGroqStatusMsg("✓ Groq Connection Verified! Ultra-fast models active.");
      } else {
        const err = await res.json().catch(() => ({}));
        setGroqStatusMsg(`⚠ Groq API Error: ${err.error?.message || "Invalid API key"}`);
      }
    } catch (err) {
      setGroqStatusMsg(`⚠ Network request failed: ${err.message}`);
    } finally {
      setTestingGroq(false);
    }
  };

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("optimal") || s.includes("normal")) return "bio-status-optimal";
    if (s.includes("elevated") || s.includes("borderline") || s.includes("low") || s.includes("attention"))
      return "bio-status-elevated";
    if (s.includes("critical") || s.includes("high risk")) return "bio-status-critical";
    return "bio-status-optimal";
  };

  const printAnalysisDossier = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Please enable popups to print report analysis.");
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Medical AI Sushruta - Clinical Diagnostic Analysis</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 32px; color: #0f172a; line-height: 1.5; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 20px; font-weight: 800; color: #0f172a; }
    .sub { font-size: 11px; color: #64748b; font-family: monospace; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 12px; }
    .status-attention { background: #fef2f2; color: #b91c1c; border: 1px solid #f87171; }
    .status-optimal { background: #f0fdf4; color: #15803d; border: 1px solid #86efac; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0369a1; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 20px 0 10px; }
    .summary-box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px; font-size: 13px; color: #334155; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 10px; border-bottom: 1px solid #cbd5e1; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">🖨️ Print Clinical Dossier</button>
  </div>
  <div class="header">
    <div>
      <div class="brand">⚕ MEDICAL AI SUSHRUTA</div>
      <div class="sub">Clinical Diagnostic & Biomarker Intelligence Dossier</div>
      <div style="font-size: 12px; margin-top: 4px;">Document: ${result?.filename || "Clinical Diagnostic Report"}</div>
    </div>
    <div style="text-align: right;">
      <span class="status-badge ${result?.status === 'attention' ? 'status-attention' : 'status-optimal'}">
        ${result?.urgencyBadge || (result?.status === 'attention' ? 'ATTENTION REQUIRED' : 'OPTIMAL')}
      </span>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Date: ${new Date().toLocaleDateString()}</div>
    </div>
  </div>

  <div class="section-title">Clinical Synthesis & Diagnostic Summary</div>
  <div class="summary-box">${result?.summary || "Clinical diagnostic breakdown."}</div>

  <div class="section-title">Identified Laboratory Biomarkers & Reference Standards</div>
  <table>
    <thead>
      <tr>
        <th>Biomarker / Test Name</th>
        <th>Measured Result</th>
        <th>Reference Interval</th>
        <th>Diagnostic Status</th>
      </tr>
    </thead>
    <tbody>
      ${(result?.biomarkers || []).map(b => `
        <tr>
          <td><strong>${b.name}</strong></td>
          <td>${b.value}</td>
          <td>${b.ref}</td>
          <td>${b.status}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  ${result?.potentialRisks && result.potentialRisks.length > 0 ? `
    <div class="section-title">Potential Health Risks if Unmanaged</div>
    <ul>
      ${result.potentialRisks.map(r => `<li style="font-size: 12px; margin-bottom: 4px;">${r}</li>`).join("")}
    </ul>
  ` : ""}

  ${result?.clinicalRecommendations && result.clinicalRecommendations.length > 0 ? `
    <div class="section-title">Actionable Recommendations & Retest Timeline</div>
    <ul>
      ${result.clinicalRecommendations.map(c => `<li style="font-size: 12px; margin-bottom: 4px;">${c}</li>`).join("")}
    </ul>
  ` : ""}

  <div class="footer">
    Medical AI Sushruta provides educational clinical guidance. This report does not replace an in-person physical examination by a licensed medical physician.
  </div>
</body>
</html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Page Header with Groq Engine Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: "12px", background: "rgba(102, 252, 241, 0.12)", border: "1px solid var(--neon-cyan)", color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 11, marginBottom: 8 }}>
            <span>⚡ AI BIOMARKER INGESTION & DIAGNOSTIC INTELLIGENCE</span>
          </div>
          <h1 className="section-title" style={{ margin: 0, fontSize: 22 }}>
            📊 MEDICAL REPORT ANALYZER
          </h1>
          <p className="section-subtitle" style={{ margin: "4px 0 0", fontSize: 13 }}>
            Upload pathology PDF reports, CBC blood panels, or paste diagnostic laboratory values for an automated clinical breakdown.
          </p>
        </div>

        {/* Engine Status & Groq Key Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "20px",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)"
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: groqKeyInput ? "var(--neon-green)" : "var(--neon-cyan)", boxShadow: "0 0 8px currentColor" }} />
            <span>Engine: {groqKeyInput ? "Groq (Custom Key)" : "Groq / Sushruta AI"}</span>
          </div>

          <button
            onClick={() => setShowGroqModal(true)}
            className="btn-cyber purple"
            style={{ padding: "6px 14px", fontSize: 12 }}
          >
            <span>⚙️ GROQ API KEY</span>
          </button>
        </div>
      </div>

      {/* Groq Key Settings Modal */}
      {showGroqModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11, 12, 16, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20
          }}
          onClick={() => setShowGroqModal(false)}
        >
          <div
            className="cyber-card"
            style={{ maxWidth: 480, width: "100%", padding: 24, boxShadow: "var(--glow-cyan)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "var(--neon-cyan)" }}>
                ⚡ GROQ INFERENCE SETTINGS
              </div>
              <button
                onClick={() => setShowGroqModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
              Groq provides ultra-fast inference (Llama 3.3 70B & Llama 3.1 8B). Enter your API key below or leave blank to utilize system default inference.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 6 }}>
                GROQ API KEY (gsk_...)
              </label>
              <input
                type="password"
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={groqKeyInput}
                onChange={(e) => setGroqKeyInput(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12
                }}
              />
            </div>

            {groqStatusMsg && (
              <div style={{ marginBottom: 14, fontSize: 12, color: groqStatusMsg.startsWith("✓") ? "var(--neon-green)" : "var(--neon-red)", fontFamily: "var(--font-mono)" }}>
                {groqStatusMsg}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={handleTestGroqKey}
                disabled={testingGroq || !groqKeyInput.trim()}
                className="btn-cyber purple"
                style={{ padding: "8px 16px", fontSize: 12 }}
              >
                <span>{testingGroq ? "Testing..." : "Test Key"}</span>
              </button>
              <button
                onClick={handleSaveGroqKey}
                className="btn-cyber"
                style={{ padding: "8px 18px", fontSize: 12 }}
              >
                <span>Save Key</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="tab-bar" style={{ margin: 0 }}>
        <button
          className={`tab-btn ${mode === "text" ? "active" : ""}`}
          onClick={() => setMode("text")}
        >
          ✏️ Paste Lab Report Text
        </button>
        <button
          className={`tab-btn ${mode === "file" ? "active" : ""}`}
          onClick={() => setMode("file")}
        >
          📄 Upload Document / PDF
        </button>
        <button
          className={`tab-btn ${mode === "history" ? "active" : ""}`}
          onClick={() => setMode("history")}
        >
          📁 Analyzed Reports History ({recentReports.length})
        </button>
      </div>

      {/* One-Click Pre-Loaded Sample Reports */}
      {mode !== "history" && (
        <div className="cyber-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)" }}>
              ⚡ QUICK SAMPLES (CLICK TO INSTANTLY TEST ANALYSIS):
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {SAMPLE_REPORTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTextInput(sample.text);
                  setMode("text");
                  handleTextAnalysis(sample.text, sample.filename);
                }}
                className="btn-cyber purple"
                style={{
                  padding: "6px 12px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer"
                }}
              >
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode 1: Text Mode */}
      {mode === "text" && (
        <div className="cyber-card">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste complete diagnostic report or laboratory test metrics here... e.g.&#10;&#10;Fasting Glucose: 135 mg/dL (High)&#10;HbA1c: 7.1 % (Elevated)&#10;Serum Creatinine: 1.1 mg/dL&#10;eGFR: 88 mL/min&#10;WBC: 7.2 x10^3/uL&#10;Platelets: 240 x10^3/uL"
            style={{
              width: "100%",
              minHeight: 180,
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
          <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              className="btn-cyber"
              onClick={() => handleTextAnalysis()}
              disabled={!textInput.trim() || loading}
            >
              <span>{loading ? "⚡ ANALYZING BIOMARKERS..." : "⚡ ANALYZE REPORT WITH AI"}</span>
            </button>
            {textInput && (
              <button
                className="btn-cyber purple"
                onClick={() => { setTextInput(""); setResult(null); }}
              >
                <span>✕ CLEAR INPUT</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: File Mode */}
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
          <div className="drop-text" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
            Drag & drop your medical report here
          </div>
          <div className="drop-hint" style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            Supported formats: PDF Pathology, Complete Blood Count, TXT, CSV, PNG, JPG • Max 10MB
          </div>
        </div>
      )}

      {/* Mode 3: History Mode */}
      {mode === "history" && (
        <div className="cyber-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 14, color: "var(--neon-cyan)", margin: 0 }}>
              RECENT DIAGNOSTIC ANALYSES
            </h3>
            <button onClick={fetchReportHistory} className="btn-cyber purple" style={{ padding: "4px 10px", fontSize: 11 }}>
              <span>🔄 Refresh</span>
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ textAlign: "center", padding: 30 }}>
              <div className="cyber-spinner" style={{ margin: "0 auto 12px" }}></div>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Loading past report records...</span>
            </div>
          ) : recentReports.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)", fontSize: 13 }}>
              No analyzed reports recorded yet. Upload a report or run a quick sample above!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentReports.map((rep) => {
                let biomarkers = [];
                try {
                  biomarkers = typeof rep.biomarkers === "string" ? JSON.parse(rep.biomarkers) : (rep.biomarkers || []);
                } catch {}

                const isAttention = (rep.status || "").toLowerCase().includes("attention");

                return (
                  <div
                    key={rep.id}
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius)",
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 14,
                      flexWrap: "wrap"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                        {rep.title || rep.filename}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginTop: 3 }}>
                        {new Date(rep.created_at).toLocaleString()} • {biomarkers.length} Biomarkers Identified
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: isAttention ? "rgba(255, 0, 64, 0.15)" : "rgba(0, 255, 135, 0.15)",
                          color: isAttention ? "var(--neon-red)" : "var(--neon-green)",
                          border: `1px solid ${isAttention ? "var(--neon-red)" : "var(--neon-green)"}`
                        }}
                      >
                        {isAttention ? "⚠ ATTENTION" : "✓ OPTIMAL"}
                      </span>

                      <button
                        className="btn-cyber"
                        style={{ padding: "6px 14px", fontSize: 11 }}
                        onClick={() => {
                          setResult({
                            filename: rep.filename,
                            status: rep.status,
                            summary: rep.summary,
                            biomarkers: biomarkers,
                            engineUsed: "Retrieved from Records"
                          });
                        }}
                      >
                        <span>View Analysis</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div style={{ textAlign: "center", padding: 50 }}>
          <div className="cyber-spinner" style={{ margin: "0 auto 16px" }}></div>
          <div style={{ color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
            Parsing laboratory biomarkers & running differential AI evaluation...
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6 }}>
            Extracting reference standards, checking organ systems, and evaluating triage level
          </div>
        </div>
      )}

      {/* Comprehensive Analysis Results */}
      {result && !loading && (
        <div className="report-result" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Result Card */}
          <div className="cyber-card" style={{ padding: 24, boxShadow: "var(--glow-cyan)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 16, letterSpacing: 1.5, color: "var(--text-primary)", margin: 0 }}>
                    CLINICAL DIAGNOSTIC BREAKDOWN
                  </h2>
                  {result.engineUsed && (
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 4, background: "rgba(102, 252, 241, 0.12)", color: "var(--neon-cyan)", border: "1px solid var(--neon-cyan)" }}>
                      {result.engineUsed}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 4 }}>
                  Document: {result.filename || "Diagnostic Lab Data"} • Generated {new Date().toLocaleTimeString()}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`status-badge ${result.status === "attention" ? "attention" : "optimal"}`}>
                  {result.urgencyBadge || (result.status === "attention" ? "⚠ ATTENTION REQUIRED" : "✓ OPTIMAL RANGE")}
                </span>
                <button
                  onClick={printAnalysisDossier}
                  className="btn-cyber purple"
                  style={{ padding: "6px 12px", fontSize: 11 }}
                  title="Print official clinical dossier"
                >
                  <span>🖨️ Print Dossier</span>
                </button>
              </div>
            </div>

            <div className="hud-line" style={{ margin: "14px 0" }}></div>

            {/* Diagnostic Summary */}
            <div style={{ background: "rgba(11, 12, 16, 0.6)", border: "1px solid var(--border-default)", borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Clinical Synthesis:
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-primary)", margin: 0 }}>
                {result.summary}
              </p>
            </div>

            {/* Organ Systems Impact Cards (if available) */}
            {result.organSystemsImpacted && result.organSystemsImpacted.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: 1, color: "var(--neon-cyan)", marginBottom: 12 }}>
                  ORGAN SYSTEM & METABOLIC IMPACT
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {result.organSystemsImpacted.map((sys, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid rgba(255, 184, 0, 0.3)",
                        borderRadius: "var(--radius)",
                        padding: 14,
                        borderLeft: "3px solid var(--neon-amber)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{sys.system}</span>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--neon-amber)", fontWeight: 700 }}>{sys.status}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {sys.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Biomarkers Grid */}
            {result.biomarkers && result.biomarkers.length > 0 ? (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: 1, color: "var(--neon-cyan)", marginBottom: 12 }}>
                  EXTRACTED LABORATORY BIOMARKERS ({result.biomarkers.length})
                </h3>
                <div className="biomarker-grid">
                  {result.biomarkers.map((bio, i) => (
                    <div key={i} className="biomarker-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div className="bio-name">{bio.name}</div>
                        <div className="bio-ref">Ref: {bio.ref || "Normative Standard"}</div>
                        {bio.clinicalSignificance && (
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                            {bio.clinicalSignificance}
                          </div>
                        )}
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
              </div>
            ) : (
              <div style={{ padding: 18, background: "var(--bg-input)", borderRadius: "var(--radius)", marginBottom: 20, color: "var(--text-secondary)", fontSize: 13 }}>
                ℹ No discrete numerical biomarkers were parsed from this specific text or file. Please ensure values and units (e.g. Glucose: 110 mg/dL) are present.
              </div>
            )}

            {/* Health Risks & Clinical Recommendations */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {result.potentialRisks && result.potentialRisks.length > 0 && (
                <div style={{ background: "rgba(255, 0, 64, 0.05)", border: "1px solid rgba(255, 0, 64, 0.2)", borderRadius: "var(--radius)", padding: 16 }}>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-red)", fontWeight: 700, marginBottom: 8 }}>
                    ⚠ POTENTIAL DOWNSTREAM RISKS:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {result.potentialRisks.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.clinicalRecommendations && result.clinicalRecommendations.length > 0 && (
                <div style={{ background: "rgba(0, 255, 135, 0.05)", border: "1px solid rgba(0, 255, 135, 0.2)", borderRadius: "var(--radius)", padding: 16 }}>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-green)", fontWeight: 700, marginBottom: 8 }}>
                    ✓ CLINICAL RECOMMENDATIONS & ACTION STEPS:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {result.clinicalRecommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommended Specialist Call to Action */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(102, 252, 241, 0.1), rgba(138, 43, 226, 0.15))",
                border: "1px solid var(--neon-cyan)",
                borderRadius: "var(--radius)",
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", textTransform: "uppercase" }}>
                  RECOMMENDED MEDICAL CONSULTATION
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                  Consult a Specialist: {result.recommendedSpecialist || "General Physician"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  Correlate these laboratory findings with an in-person physical consultation or secure telehealth review.
                </div>
              </div>

              <button
                className="btn-cyber"
                style={{ padding: "12px 24px" }}
                onClick={() => {
                  const spec = result.recommendedSpecialist || "General Medicine";
                  navigate(`/book-doctor?specialty=${encodeURIComponent(spec)}`);
                }}
              >
                <span>📅 BOOK A {((result.recommendedSpecialist || "SPECIALIST").toUpperCase())}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
