import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      const { token, user, doctor } = res.data;

      // Save to local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (doctor) {
        localStorage.setItem('doctor', JSON.stringify(doctor));
      }

      // Role-based redirects
      if (user.role === 'patient') {
        navigate('/dashboard/patient');
      } else if (user.role === 'doctor') {
        navigate('/dashboard/doctor');
      } else if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/');
      }

      // Refresh page to update navbar state
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container py-5 d-flex justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}
    >
      <div className="card glass-card border-0 p-5 shadow-lg col-md-6 col-lg-5 animate-fade-in-up">
        <div className="text-center mb-4">
          <i className="bi bi-shield-lock fs-1 text-primary"></i>
          <h2 className="fw-bold mt-2">Welcome Back</h2>
          <p className="text-muted small">Sign in to your e-Scheduling account</p>
        </div>

        {error && (
          <div
            className="alert alert-danger border-0 rounded-3 text-center small py-2 mb-3"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fs-6 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <p className="text-center small text-muted mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary fw-semibold text-decoration-none">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
