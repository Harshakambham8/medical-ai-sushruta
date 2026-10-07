import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WarningBanner from "../components/WarningBanner";

function Home() {
  const navigate = useNavigate();
  const [quickQuery, setQuickQuery] = useState("");

  const samplePrompts = [
    "What are common triggers of ocular migraines?",
    "Interpret elevated neutrophil levels in CBC report",
    "Difference between bronchitis and pneumonia symptoms",
    "Post-workout muscle soreness vs joint inflammation"
  ];

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    navigate(`/chat?query=${encodeURIComponent(quickQuery)}`);
  };

  const handleChipClick = (prompt) => {
    navigate(`/chat?query=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="home-page-root">
      <Navbar />
      <WarningBanner />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="badge-neon-pill hero-badge">
              <span className="pulse-beacon-green" />
              <span>THE FUTURE OF HEALTHCARE INTELLIGENCE</span>
            </div>

            <h1 className="hero-title">
              Intelligent Healthcare Guidance at the <span className="text-neon-gradient">Speed of Light</span>
            </h1>

            <p className="hero-lead">
              Medical AI Sushruta synthesizes clinical medical literature, lab report biomarkers, and conversational symptom guidance into instantaneous, physician-grade educational insights.
            </p>

            {/* Primary Action Buttons */}
            <div className="hero-actions">
              <Link to="/chat" className="btn-neon-cta hero-cta-btn">
                <span>Start AI Consultation</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link to="/reports" className="btn-glass hero-secondary-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>Upload Medical Report</span>
              </Link>
            </div>

            {/* Instant Query Console */}
            <form onSubmit={handleQuickSubmit} className="quick-query-box glass-panel">
              <div className="quick-query-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ask Sushruta: 'Explain persistent dizziness after standing'..."
                className="quick-query-input"
              />
              <button type="submit" className="quick-query-submit btn-neon-cta">
                Analyze
              </button>
            </form>

            {/* Sample Chips */}
            <div className="quick-chips-wrapper">
              <span className="chips-label">Popular queries:</span>
              <div className="chips-list">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(prompt)}
                    className="query-chip"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Visual Asset Showcase */}
          <div className="hero-visual-wrapper">
            <div className="hero-visual-frame glass-panel-elevated">
              <div className="frame-glow-aura" />
              <img
                src="/medical_ai_hero.jpg"
                alt="Medical AI Sushruta Holographic Clinical Telemetry"
                className="hero-image"
              />

              {/* Floating High-Tech Telemetry Cards */}
              <div className="floating-card float-card-top glass-panel">
                <div className="float-card-header">
                  <span className="pulse-beacon-green" />
                  <span className="float-card-tag font-mono">BIOMARKER MONITOR</span>
                </div>
                <div className="float-card-metric">SpO2: 99% • Sinus Rhythm</div>
                <div className="float-card-sub">Real-time physiological telemetry</div>
              </div>

              <div className="floating-card float-card-bottom glass-panel">
                <div className="float-card-header">
                  <span className="pulse-beacon-blue" />
                  <span className="float-card-tag font-mono">CLINICAL ENGINE</span>
                </div>
                <div className="float-card-metric">Gemini 2.5 Flash Active</div>
                <div className="float-card-sub">Inference latency: 218ms</div>
              </div>

              <div className="floating-card float-card-alert glass-panel">
                <div className="float-card-header">
                  <span className="pulse-beacon-red" />
                  <span className="float-card-tag font-mono" style={{ color: "#ff2a5f" }}>ALERT PROTOCOL</span>
                </div>
                <div className="float-card-metric" style={{ fontSize: "0.82rem" }}>
                  Zero Critical Red Flags
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="metrics-section">
        <div className="container">
          <div className="metrics-grid glass-panel">
            <div className="metric-item">
              <div className="metric-value font-mono text-neon-gradient">99.4%</div>
              <div className="metric-title">Report Parser Precision</div>
              <div className="metric-desc">Automated blood test & biomarker extraction</div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-value font-mono text-neon-gradient">&lt; 240ms</div>
              <div className="metric-title">Neural Response Latency</div>
              <div className="metric-desc">Real-time conversational healthcare stream</div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-value font-mono text-neon-gradient">100%</div>
              <div className="metric-title">Private & HIPAA-Conscious</div>
              <div className="metric-desc">Zero training on identifiable patient data</div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-value font-mono text-neon-gradient">24 / 7</div>
              <div className="metric-title">Always Available</div>
              <div className="metric-desc">Immediate educational guidance on any device</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="badge-neon-pill">
              <span>CORE ARCHITECTURE</span>
            </div>
            <h2 className="section-title">
              Engineered for Clinical Precision & Trust
            </h2>
            <p className="section-subtitle">
              Sushruta combines biomedical knowledge bases with generative artificial intelligence, delivering structured triage and clarity without medical jargon.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card glass-panel">
              <div className="icon-neon-shell">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="feature-title">Neural Symptom Chat</h3>
              <p className="feature-text">
                Engage in an intuitive conversational triage session. Sushruta breaks down complex health concerns into concise, digestible explanations with embedded safety disclaimers.
              </p>
              <Link to="/chat" className="feature-link">
                Launch Chat Console &rarr;
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="feature-card glass-panel">
              <div className="icon-neon-shell">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </div>
              <h3 className="feature-title">Diagnostic Report Parser</h3>
              <p className="feature-text">
                Upload laboratory PDFs, CBC panels, and metabolic profiles. The OCR ingestion engine translates complex clinical figures into plain-English summaries.
              </p>
              <Link to="/reports" className="feature-link">
                Analyze Report &rarr;
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="feature-card glass-panel">
              <div className="icon-neon-shell">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3 className="feature-title">Biomarker Health Records</h3>
              <p className="feature-text">
                Maintain an organized view of historical diagnostic panels. Identify physiological trends across time and prepare actionable question checklists for physician visits.
              </p>
              <Link to="/dashboard" className="feature-link">
                View Dashboard &rarr;
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="feature-card glass-panel">
              <div className="icon-neon-shell">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="feature-title">Clinical Guardrails & Triage</h3>
              <p className="feature-text">
                Trained with strict educational constraints: refuses to fabricate diagnoses, provides clear medical consultation advisories, and highlights emergency red flags instantly.
              </p>
              <span className="feature-tag-pill font-mono">100% ETHICAL AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Protocol Banner with Subtle Neon Red Highlights */}
      <section className="safety-section">
        <div className="container">
          <div className="safety-box glass-panel">
            <div className="safety-alert-header">
              <span className="pulse-beacon-red" />
              <span className="font-mono safety-tag">ETHICAL SAFEGUARD PROTOCOL</span>
            </div>
            <div className="safety-content">
              <div className="safety-text-block">
                <h3>Designed for Knowledge, Calibrated for Safety</h3>
                <p>
                  Medical AI Sushruta is programmed never to provide direct prescriptions or replace real physicians. Instead, it serves as a bridge: empowering patients with questions, terminology translation, and symptom understanding before their appointments.
                </p>
              </div>
              <div className="safety-badges">
                <div className="safety-badge-item">
                  <span className="check-icon">✓</span>
                  <span>No Hallucinated Diagnoses</span>
                </div>
                <div className="safety-badge-item">
                  <span className="check-icon">✓</span>
                  <span>Peer-Reviewed Knowledge Bounds</span>
                </div>
                <div className="safety-badge-item">
                  <span className="check-icon">✓</span>
                  <span>Subtle Neon Red Triage Flags</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Call to Action Section */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-banner-card glass-panel-elevated">
            <div className="cta-banner-glow" />
            <h2 className="cta-banner-title">
              Experience the Future of Healthcare Intelligence
            </h2>
            <p className="cta-banner-subtitle">
              Instant responses, secure report parsing, and clean healthcare explanations. Completely free for educational use.
            </p>
            <div className="cta-banner-buttons">
              <Link to="/chat" className="btn-neon-cta">
                <span>Start Immediate Consultation</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/reports" className="btn-glass">
                <span>Upload Lab Results</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Clean Footer */}
      <footer className="footer-root">
        <div className="container footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="brand-logo-shell">
                <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 2v20M2 12h20" stroke="url(#footIconGrad)" strokeWidth="2.5" />
                  <defs>
                    <linearGradient id="footIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0066ff" />
                      <stop offset="100%" stopColor="#00e599" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="brand-text-block">
                <span className="brand-title">SUSHRUTA</span>
                <span className="brand-subtitle">MEDICAL AI PLATFORM</span>
              </div>
            </div>

            <p className="footer-mission">
              Pioneering compassionate, accessible, and mathematically grounded biomedical communication.
            </p>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright font-mono">
              © {new Date().getFullYear()} Medical AI Sushruta • Next-Gen Biomedical Intelligence
            </p>
            <p className="footer-disclaimer">
              Disclaimer: All generated materials are intended strictly for educational health literacy. Always consult a licensed physician for medical conditions.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .home-page-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Hero Section */
        .hero-section {
          padding-top: 60px;
          padding-bottom: 70px;
          position: relative;
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 48px;
          align-items: center;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .hero-badge {
          align-self: flex-start;
        }

        .hero-title {
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .hero-lead {
          font-size: 1.12rem;
          line-height: 1.65;
          color: var(--text-secondary);
          max-width: 580px;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 6px;
        }

        .hero-cta-btn {
          font-size: 1rem;
          padding: 15px 32px;
        }

        .hero-secondary-btn {
          font-size: 1rem;
          padding: 15px 28px;
        }

        /* Quick Query Box */
        .quick-query-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px 8px 18px;
          border-radius: 9999px;
          margin-top: 14px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 8px 30px rgba(0, 102, 255, 0.08);
          border: 1px solid rgba(0, 102, 255, 0.2);
        }

        .quick-query-icon {
          color: var(--neon-blue);
          display: flex;
          align-items: center;
        }

        .quick-query-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.94rem;
          font-family: inherit;
          color: var(--text-primary);
        }

        .quick-query-input::placeholder {
          color: var(--text-light);
        }

        .quick-query-submit {
          padding: 10px 22px;
          font-size: 0.88rem;
          box-shadow: none;
        }

        .quick-chips-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chips-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .chips-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .query-chip {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-size: 0.82rem;
          padding: 6px 14px;
          border-radius: 9999px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .query-chip:hover {
          background: #ffffff;
          border-color: var(--neon-cyan);
          color: var(--neon-blue);
          box-shadow: 0 2px 10px rgba(0, 102, 255, 0.1);
          transform: translateY(-1px);
        }

        /* Hero Visual Showcase */
        .hero-visual-wrapper {
          position: relative;
        }

        .hero-visual-frame {
          position: relative;
          border-radius: 24px;
          overflow: visible;
          padding: 10px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(0, 102, 255, 0.2);
          box-shadow: 0 25px 60px -15px rgba(0, 102, 255, 0.15);
        }

        .frame-glow-aura {
          position: absolute;
          inset: -15px;
          border-radius: 32px;
          background: radial-gradient(circle, rgba(0, 210, 255, 0.15) 0%, rgba(0, 229, 153, 0.1) 50%, transparent 70%);
          z-index: -1;
          filter: blur(20px);
        }

        .hero-image {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 18px;
          object-fit: cover;
        }

        /* Floating Telemetry Badges */
        .floating-card {
          position: absolute;
          padding: 10px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(14px);
        }

        .float-card-top {
          top: -20px;
          right: -15px;
        }

        .float-card-bottom {
          bottom: -20px;
          left: -15px;
        }

        .float-card-alert {
          bottom: 25px;
          right: -20px;
          border-color: rgba(255, 42, 95, 0.25);
        }

        .float-card-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }

        .float-card-tag {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--neon-emerald);
        }

        .float-card-metric {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .float-card-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .pulse-beacon-blue {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--neon-cyan);
          box-shadow: 0 0 10px var(--neon-cyan);
          animation: pulseBeacon 2s infinite;
        }

        /* Metrics Strip */
        .metrics-section {
          padding-top: 10px;
          padding-bottom: 60px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
          align-items: center;
          padding: 30px 40px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
        }

        .metric-item {
          text-align: center;
        }

        .metric-value {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 6px;
        }

        .metric-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .metric-desc {
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .metric-divider {
          width: 1px;
          height: 48px;
          background: var(--border-subtle);
        }

        /* Core Features */
        .features-section {
          padding-top: 60px;
          padding-bottom: 80px;
        }

        .section-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 50px auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .section-title {
          font-size: 2.3rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .section-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .feature-card {
          padding: 32px 28px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .feature-text {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.6;
          flex: 1;
        }

        .feature-link {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--neon-blue);
          text-decoration: none;
          transition: var(--transition-smooth);
        }

        .feature-link:hover {
          color: var(--neon-emerald);
          transform: translateX(4px);
        }

        .feature-tag-pill {
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--neon-emerald);
          letter-spacing: 0.05em;
        }

        /* Safety Protocol Section */
        .safety-section {
          padding-top: 20px;
          padding-bottom: 70px;
        }

        .safety-box {
          padding: 36px 40px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 42, 95, 0.18);
          box-shadow: 0 10px 30px rgba(255, 42, 95, 0.05);
          border-radius: 22px;
        }

        .safety-alert-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .safety-tag {
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--neon-red);
          letter-spacing: 0.08em;
        }

        .safety-content {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 36px;
          align-items: center;
        }

        .safety-text-block h3 {
          font-size: 1.45rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
        }

        .safety-text-block p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        .safety-badges {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .safety-badge-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.75);
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
        }

        .check-icon {
          color: var(--neon-emerald);
          font-weight: bold;
        }

        /* CTA Banner */
        .cta-banner-section {
          padding-top: 20px;
          padding-bottom: 90px;
        }

        .cta-banner-card {
          padding: 60px 40px;
          text-align: center;
          border-radius: 28px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.9) 100%);
          border: 1px solid rgba(0, 102, 255, 0.2);
          box-shadow: 0 25px 60px -15px rgba(0, 102, 255, 0.15);
        }

        .cta-banner-glow {
          position: absolute;
          top: -50%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(0, 210, 255, 0.18) 0%, rgba(0, 229, 153, 0.15) 50%, transparent 80%);
          filter: blur(40px);
          z-index: 0;
          pointer-events: none;
        }

        .cta-banner-title {
          font-size: 2.4rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }

        .cta-banner-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 620px;
          margin: 0 auto 30px auto;
          position: relative;
          z-index: 1;
        }

        .cta-banner-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        /* Corporate Footer */
        .footer-root {
          background: #ffffff;
          border-top: 1px solid var(--border-subtle);
          padding-top: 50px;
          padding-bottom: 40px;
          margin-top: auto;
        }

        .footer-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-mission {
          font-size: 0.88rem;
          color: var(--text-muted);
          max-width: 440px;
          text-align: right;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid var(--border-subtle);
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .footer-disclaimer {
          max-width: 580px;
          text-align: right;
          color: var(--text-light);
          font-size: 0.76rem;
        }

        /* Responsive Breakpoints */
        @media (max-width: 980px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-badge {
            align-self: center;
          }
          .hero-lead {
            margin: 0 auto;
          }
          .hero-actions {
            justify-content: center;
          }
          .quick-chips-wrapper {
            align-items: center;
          }
          .chips-list {
            justify-content: center;
          }
          .metrics-grid {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .metric-divider {
            display: none;
          }
          .safety-content {
            grid-template-columns: 1fr;
          }
          .footer-top, .footer-bottom {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
          .footer-mission, .footer-disclaimer {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;