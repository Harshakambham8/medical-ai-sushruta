import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WarningBanner from "../components/WarningBanner";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", isError: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback({ text: "Please enter both email and password.", isError: true });
      return;
    }

    setLoading(true);
    setFeedback({ text: "", isError: false });

    try {
      const response = await API.post("/auth/login", { email, password });
      if (response.data.message === "Login successful") {
        setFeedback({ text: "Login successful! Redirecting to clinical records...", isError: false });
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setFeedback({ text: response.data.message || "Invalid credentials", isError: true });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ text: "Authentication error. Ensure server is online.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      <Navbar />
      <WarningBanner />

      <main className="container auth-container">
        <div className="auth-card glass-panel-elevated">
          <div className="auth-header">
            <div className="auth-badge-shell">
              <span className="pulse-beacon-green" />
              <span className="font-mono auth-tag">SECURE CLINICAL ACCESS</span>
            </div>
            <h1 className="auth-title">Welcome Back to Sushruta</h1>
            <p className="auth-subtitle">Access your confidential health triage logs and laboratory reports.</p>
          </div>

          {feedback.text && (
            <div className={feedback.isError ? "alert-neon-red" : "alert-neon-green"}>
              <span className={feedback.isError ? "pulse-beacon-red" : "pulse-beacon-green"} />
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label font-mono">PATIENT OR CLINICIAN EMAIL</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label font-mono">ENCRYPTED PASSWORD</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-neon-cta auth-submit-btn">
              {loading ? "Authenticating..." : "Sign In to Portal"}
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="auth-link">Create Account &rarr;</Link>
          </div>
        </div>
      </main>

      <style>{`
        .auth-page-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-pure);
        }

        .auth-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 40px;
          padding-bottom: 60px;
        }

        .auth-card {
          width: 100%;
          max-width: 460px;
          padding: 42px 36px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 102, 255, 0.2);
          box-shadow: 0 25px 60px -15px rgba(0, 102, 255, 0.12);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .auth-badge-shell {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(240, 253, 244, 0.9);
          border: 1px solid rgba(0, 229, 153, 0.3);
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 6px;
        }

        .auth-tag {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--neon-emerald);
          letter-spacing: 0.06em;
        }

        .auth-title {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .auth-subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        .form-input {
          padding: 13px 18px;
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
          background: #f8fafc;
          font-size: 0.94rem;
          outline: none;
          color: var(--text-primary);
          transition: var(--transition-smooth);
        }

        .form-input:focus {
          border-color: var(--neon-cyan);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.12);
        }

        .auth-submit-btn {
          margin-top: 8px;
          padding: 14px;
          font-size: 0.96rem;
        }

        .alert-neon-green {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 229, 153, 0.08);
          border: 1px solid rgba(0, 229, 153, 0.3);
          color: var(--neon-emerald);
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 0.86rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .auth-link {
          color: var(--neon-blue);
          font-weight: 600;
          text-decoration: none;
        }

        .auth-link:hover {
          color: var(--neon-emerald);
        }
      `}</style>
    </div>
  );
}

export default Login;