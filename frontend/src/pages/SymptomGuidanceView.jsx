import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const QUICK_SYMPTOM_SUGGESTIONS = [
  "High Fever (102°F+)",
  "Severe Stabbing Headache",
  "Nuchal Rigidity / Stiff Neck",
  "Chest Pain / Pressure",
  "Shortness of Breath (Dyspnea)",
  "Persistent Dry Cough",
  "Severe Abdominal Cramps",
  "Nausea & Vomiting",
  "Dizziness / Vertigo",
  "Unexplained Severe Fatigue",
  "Joint Swelling & Pain",
  "Skin Rash / Petechiae"
];

const SEVERITY_OPTIONS = [
  { level: "Mild", label: "🟢 Mild", desc: "Noticeable but does not restrict normal activity", color: "var(--neon-green)" },
  { level: "Moderate", label: "🟡 Moderate", desc: "Disrupts normal tasks, constant discomfort", color: "#ffc107" },
  { level: "Severe", label: "🟠 Severe", desc: "Debilitating, intense pain or marked impairment", color: "#ff8800" },
  { level: "Critical", label: "🔴 Critical", desc: "Acute medical crisis, unbearable or life-threatening", color: "var(--neon-red)" }
];

const EFFECTIVE_FROM_OPTIONS = [
  "Just Started (< 6 Hours)",
  "Since 1–2 Days",
  "Since 3–7 Days (1 Week)",
  "Past 2–3 Weeks",
  "Chronic (> 1 Month)"
];

export default function SymptomGuidanceView() {
  // Current Symptom Input State
  const [symptomText, setSymptomText] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("Moderate");
  const [selectedEffectiveFrom, setSelectedEffectiveFrom] = useState("Since 1–2 Days");
  const [customEffective, setCustomEffective] = useState("");

  // Accumulated Symptoms in the intake box
  const [symptomsList, setSymptomsList] = useState([
    {
      id: 1,
      symptom: "High Fever (102.5°F)",
      severity: "Severe",
      effectiveFrom: "Since 1–2 Days"
    },
    {
      id: 2,
      symptom: "Severe Stiff Neck & Throbbing Headache",
      severity: "Critical",
      effectiveFrom: "Just Started (< 6 Hours)"
    }
  ]);

  const [patientNotes, setPatientNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");

  // Add symptom to the intake box
  const handleAddSymptom = (e) => {
    if (e) e.preventDefault();
    if (!symptomText.trim()) return;

    const effectiveFromVal = customEffective.trim() || selectedEffectiveFrom;
    const newEntry = {
      id: Date.now(),
      symptom: symptomText.trim(),
      severity: selectedSeverity,
      effectiveFrom: effectiveFromVal
    };

    setSymptomsList((prev) => [...prev, newEntry]);
    setSymptomText("");
    setCustomEffective("");
  };

  const handleRemoveSymptom = (id) => {
    setSymptomsList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAll = () => {
    setSymptomsList([]);
    setEvaluation(null);
    setError("");
  };

  const handleQuickAdd = (sym) => {
    setSymptomText(sym);
  };

  // Submit symptoms cluster to Groq AI Evaluation Engine
  const handleSubmitEvaluation = async () => {
    if (symptomsList.length === 0) {
      setError("Please add at least one symptom to your profile before running evaluation.");
      return;
    }

    setLoading(true);
    setError("");
    setEvaluation(null);

    try {
      const res = await API.post("/api/symptoms/evaluate", {
        symptoms: symptomsList,
        patientNotes: patientNotes.trim()
      });

      if (res.data.success && res.data.data) {
        setEvaluation({
          ...res.data.data,
          engine: res.data.engine
        });
      } else {
        setError("Unable to process clinical evaluation. Please check backend connectivity.");
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        "Failed to reach Groq evaluation engine. Please verify network."
      );
    } finally {
      setLoading(false);
    }
  };

  const getTriageColor = (triageLevel) => {
    switch (triageLevel) {
      case "EMERGENCY":
        return "var(--neon-red)";
      case "URGENT":
        return "#ff8800";
      case "MODERATE":
        return "var(--neon-cyan)";
      case "MILD":
      default:
        return "var(--neon-green)";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fade-in 0.3s ease-out" }}>
      {/* Header & Groq Neural Engine Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>🩺</span>
            <h1 className="section-title" style={{ margin: 0, fontSize: 22 }}>
              CLINICAL SYMPTOM EVALUATOR & DISEASE RISK PREDICTOR
            </h1>
          </div>
          <p className="section-subtitle" style={{ margin: "4px 0 0", fontSize: 13 }}>
            Construct your symptom cluster with custom severity and onset duration. Analyzed directly via the high-speed Groq Neural Diagnostic Engine.
          </p>
        </div>

        <div
          style={{
            background: "rgba(102, 252, 241, 0.08)",
            border: "1px solid var(--neon-cyan)",
            borderRadius: "var(--radius)",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--neon-cyan)",
          }}
        >
          <span className="pulse-dot"></span>
          <span>⚡ GROQ ULTRA-FAST INFERENCE ACTIVE</span>
        </div>
      </div>

      {/* Main Grid: Input Templates (Left) + Symptom Roster Box (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
        {/* LEFT COLUMN: Symptom Input & Parameter Templates */}
        <div className="cyber-card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, letterSpacing: 1.2, color: "var(--neon-cyan)" }}>
            1. CONFIGURE PATIENT SYMPTOM
          </div>

          {/* Template Box 1: Symptom Description */}
          <div>
            <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              SYMPTOM DESCRIPTION / PRESENTATION
            </label>
            <input
              type="text"
              className="cyber-input"
              placeholder="e.g. Sharp chest pain radiating to left arm, High fever..."
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSymptom(e)}
              style={{ fontSize: 13, padding: "10px 14px", width: "100%" }}
            />

            {/* Quick Suggestion Pills */}
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>QUICK SUGGESTIONS:</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                {QUICK_SYMPTOM_SUGGESTIONS.slice(0, 6).map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleQuickAdd(sym)}
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "4px",
                      padding: "3px 8px",
                      fontSize: 10,
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    + {sym}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template Box 2: Severity Selector Template */}
          <div style={{ background: "var(--bg-input)", padding: "12px 14px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
            <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-purple)", display: "block", marginBottom: 8, fontWeight: 700 }}>
              ⚡ TEMPLATE BOX: SEVERITY LEVEL
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {SEVERITY_OPTIONS.map((opt) => {
                const isSelected = selectedSeverity === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setSelectedSeverity(opt.level)}
                    style={{
                      background: isSelected ? "rgba(138, 43, 226, 0.2)" : "transparent",
                      border: isSelected ? `2px solid ${opt.color}` : "1px solid var(--border-default)",
                      borderRadius: "6px",
                      padding: "8px 10px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? opt.color : "var(--text-primary)" }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.2 }}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Box 3: Effective From / Duration Template */}
          <div style={{ background: "var(--bg-input)", padding: "12px 14px", borderRadius: "var(--radius)", border: "1px solid var(--border-default)" }}>
            <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", display: "block", marginBottom: 8, fontWeight: 700 }}>
              ⏱️ TEMPLATE BOX: EFFECTIVE FROM (ONSET DURATION)
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {EFFECTIVE_FROM_OPTIONS.map((eff) => {
                const isSelected = selectedEffectiveFrom === eff && !customEffective;
                return (
                  <button
                    key={eff}
                    type="button"
                    onClick={() => {
                      setSelectedEffectiveFrom(eff);
                      setCustomEffective("");
                    }}
                    style={{
                      background: isSelected ? "var(--neon-cyan)" : "transparent",
                      color: isSelected ? "#030816" : "var(--text-secondary)",
                      border: isSelected ? "1px solid var(--neon-cyan)" : "1px solid var(--border-default)",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {eff}
                  </button>
                );
              })}
            </div>

            {/* Custom duration write-in */}
            <input
              type="text"
              className="cyber-input"
              placeholder="Or custom onset: e.g. Started at 3:00 AM after exertion..."
              value={customEffective}
              onChange={(e) => setCustomEffective(e.target.value)}
              style={{ fontSize: 11, padding: "8px 12px", width: "100%" }}
            />
          </div>

          {/* Add Symptom Button */}
          <button
            type="button"
            className="btn-cyber"
            onClick={handleAddSymptom}
            disabled={!symptomText.trim()}
            style={{ padding: "12px 20px", justifyContent: "center", fontSize: 12 }}
          >
            <span>➕ ADD SYMPTOM TO PROFILE BOX</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Active Symptoms Roster & Submission */}
        <div className="cyber-card purple" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 18 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, letterSpacing: 1.2, color: "var(--neon-purple)" }}>
                2. ACTIVE SYMPTOMS INTAKE BOX ({symptomsList.length})
              </div>
              {symptomsList.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--neon-red)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    cursor: "pointer",
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Symptoms Cards List */}
            {symptomsList.length === 0 ? (
              <div
                style={{
                  border: "2px dashed var(--border-default)",
                  borderRadius: "var(--radius)",
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>No symptoms added to your intake box yet.</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>
                  Use the template boxes on the left to add your symptoms, severity, and onset duration.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                {symptomsList.map((item, index) => {
                  const severityObj = SEVERITY_OPTIONS.find((o) => o.level === item.severity);
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius)",
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        animation: "fade-in 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                            #{index + 1}
                          </span>
                          <strong style={{ fontSize: 13, color: "var(--text-primary)" }}>
                            {item.symptom}
                          </strong>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 10 }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontWeight: 700,
                              fontFamily: "var(--font-mono)",
                              background: "rgba(0,0,0,0.3)",
                              color: severityObj ? severityObj.color : "var(--neon-cyan)",
                              border: `1px solid ${severityObj ? severityObj.color : "var(--border-default)"}`,
                            }}
                          >
                            Severity: {item.severity}
                          </span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontFamily: "var(--font-mono)",
                              background: "rgba(102, 252, 241, 0.08)",
                              color: "var(--neon-cyan)",
                              border: "1px solid rgba(102, 252, 241, 0.2)",
                            }}
                          >
                            Effective: {item.effectiveFrom}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSymptom(item.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--neon-red)",
                          cursor: "pointer",
                          fontSize: 16,
                          padding: "4px 8px",
                        }}
                        title="Remove symptom"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Optional Additional Notes */}
            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                ADDITIONAL PATIENT CONTEXT / TRIGGERS (OPTIONAL)
              </label>
              <textarea
                className="cyber-input"
                placeholder="e.g. Accompanied by mild chills, worse in evening, patient has history of hypertension..."
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                rows={2}
                style={{ fontSize: 11, padding: "8px 12px", width: "100%", resize: "none" }}
              />
            </div>
          </div>

          {/* Action Submission Button */}
          <div>
            {error && (
              <div style={{ color: "var(--neon-red)", fontSize: 12, marginBottom: 8, fontFamily: "var(--font-mono)" }}>
                ⚠ {error}
              </div>
            )}
            <button
              type="button"
              className="btn-cyber"
              onClick={handleSubmitEvaluation}
              disabled={loading || symptomsList.length === 0}
              style={{
                width: "100%",
                padding: "14px 20px",
                justifyContent: "center",
                fontSize: 13,
                background: "linear-gradient(135deg, rgba(0, 255, 135, 0.2), rgba(102, 252, 241, 0.3))",
                border: "1px solid var(--neon-green)",
                color: "var(--neon-green)",
                boxShadow: "0 0 16px rgba(0, 255, 135, 0.25)",
              }}
            >
              <span>
                {loading ? "⚡ EVALUATING VIA GROQ NEURAL ENGINE..." : "🚀 ANALYZE & PREDICT POSSIBLE DISEASES"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State Spinner */}
      {loading && (
        <div className="cyber-card" style={{ textAlign: "center", padding: 50 }}>
          <div className="cyber-spinner" style={{ margin: "0 auto 16px" }}></div>
          <div style={{ color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            Groq Neural Engine running differential symptom analysis...
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>
            Correlating symptom severity, onset timelines, and potential downstream illness complications.
          </div>
        </div>
      )}

      {/* DIAGNOSTIC RESULTS DISPLAY */}
      {evaluation && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "slide-up 0.3s ease-out" }}>
          {/* Triage Urgency Header Alert Banner */}
          <div
            className="cyber-card"
            style={{
              border: `2px solid ${getTriageColor(evaluation.triageLevel)}`,
              background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(10,15,30,0.9))`,
              boxShadow: `0 0 20px ${getTriageColor(evaluation.triageLevel)}33`,
              padding: "18px 24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>
                  {evaluation.triageLevel === "EMERGENCY" ? "🚨" : evaluation.triageLevel === "URGENT" ? "⚠️" : "🩺"}
                </span>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    DIAGNOSTIC TRIAGE LEVEL
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: getTriageColor(evaluation.triageLevel), letterSpacing: 1 }}>
                    {evaluation.urgencyBadge?.toUpperCase() || evaluation.triageLevel}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                <span>Evaluated by: </span>
                <strong style={{ color: "var(--neon-cyan)" }}>{evaluation.engine || "Groq Clinical AI"}</strong>
              </div>
            </div>

            <div className="hud-line" style={{ margin: "12px 0" }}></div>

            <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>
              <strong>Clinical Triage Advice:</strong> {evaluation.triageAdvice}
            </p>
          </div>

          {/* Core Diseases Prediction Cards */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🔬</span>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 15, letterSpacing: 1.2, margin: 0, color: "var(--text-primary)" }}>
                IDENTIFIED POSSIBLE DISEASES & MEDICAL CONDITIONS
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
              {(evaluation.possibleDiseases || []).map((disease, idx) => {
                const isHigh = disease.likelihood === "High";
                const isMod = disease.likelihood === "Moderate";
                const badgeColor = isHigh ? "var(--neon-red)" : isMod ? "#ffc107" : "var(--neon-cyan)";

                return (
                  <div
                    key={idx}
                    className="cyber-card"
                    style={{
                      border: isHigh ? "1px solid rgba(255, 0, 64, 0.4)" : "1px solid var(--border-default)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div>
                          <strong style={{ fontSize: 16, color: "var(--text-primary)", display: "block" }}>
                            {disease.name}
                          </strong>
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                            Category: {disease.icdCategory || "Clinical Pathology"}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "4px",
                            color: badgeColor,
                            border: `1px solid ${badgeColor}`,
                            background: "rgba(0,0,0,0.3)",
                            textTransform: "uppercase",
                          }}
                        >
                          {disease.likelihood} Likelihood
                        </span>
                      </div>

                      <div className="hud-line" style={{ margin: "10px 0" }}></div>

                      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                        {disease.clinicalReasoning}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border-default)" }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        DIFFERENTIAL MATCH #{idx + 1}
                      </span>
                      <Link
                        to="/book-doctor"
                        style={{ fontSize: 11, color: "var(--neon-cyan)", textDecoration: "none", fontWeight: 600, fontFamily: "var(--font-mono)" }}
                      >
                        Consult Specialist →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pathophysiology & Potential Complications Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            {/* Pathophysiology Explanation */}
            <div className="cyber-card">
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: 1, color: "var(--neon-purple)", marginBottom: 10 }}>
                🧬 UNDERLYING PATHOPHYSIOLOGICAL MECHANISM
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {evaluation.pathophysiologySummary}
              </p>
            </div>

            {/* Secondary Complications that May Occur */}
            <div className="cyber-card" style={{ border: "1px solid rgba(255, 170, 0, 0.3)" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: 1, color: "#ffaa00", marginBottom: 10 }}>
                ⚠️ POTENTIAL ILLNESSES & COMPLICATIONS IF UNTREATED
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {(evaluation.potentialComplications || []).map((comp, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    {comp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Diagnostics & Immediate Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            {/* Recommended Tests */}
            <div className="cyber-card">
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: 1, color: "var(--neon-cyan)", marginBottom: 10 }}>
                🔬 RECOMMENDED DIAGNOSTIC TESTS & LAB WORK
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(evaluation.recommendedDiagnostics || []).map((diag, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--bg-input)",
                      padding: "8px 12px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <strong style={{ fontSize: 12, color: "var(--text-primary)" }}>
                      {diag.test || diag}
                    </strong>
                    {diag.purpose && (
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        Purpose: {diag.purpose}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Immediate Action Steps & Specialist Booking */}
            <div className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: 1, color: "var(--neon-green)", marginBottom: 10 }}>
                  🛡️ IMMEDIATE SUPPORTIVE ACTIONS & SELF-CARE
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {(evaluation.immediateActions || []).map((act, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      {act}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Specialist Consult Call-to-Action */}
              <div
                style={{
                  background: "rgba(102, 252, 241, 0.08)",
                  border: "1px solid var(--neon-cyan)",
                  borderRadius: "var(--radius)",
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    RECOMMENDED SPECIALIST
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    {evaluation.recommendedSpecialist || "Primary Care Physician"}
                  </div>
                </div>

                <Link
                  to="/book-doctor"
                  className="btn-cyber"
                  style={{ fontSize: 11, padding: "8px 14px" }}
                >
                  <span>📅 BOOK DOCTOR CONSULT</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Clinical Disclaimer */}
          <div className="disclaimer" style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {evaluation.disclaimer ||
              "Disclaimer: Medical AI Sushruta provides educational clinical guidance only. Consult a qualified medical practitioner for diagnosis or treatment."}
          </div>
        </div>
      )}
    </div>
  );
}
