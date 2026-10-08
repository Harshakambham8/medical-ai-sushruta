import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('doctor');
    navigate('/login');
    window.location.reload();
  };

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-heart-pulse-fill me-2 fs-3 text-primary"></i>
          <span className="fw-bold" style={{ letterSpacing: '-0.5px' }}>
            BOOK A DOCTOR-eSCHEDULING
          </span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">Home</Link>
            </li>
            {user && user.role === 'patient' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/doctors')}`} to="/doctors">Find Doctors</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard/patient')}`} to="/dashboard/patient">My Appointments</Link>
                </li>
              </>
            )}
            {user && user.role === 'doctor' && (
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/dashboard/doctor')}`} to="/dashboard/doctor">Doctor Dashboard</Link>
              </li>
            )}
            {user && user.role === 'admin' && (
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/dashboard/admin')}`} to="/dashboard/admin">Admin Dashboard</Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <div className="text-end d-none d-sm-block">
                  <div className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>{user.name}</div>
                  <div className="text-muted small text-capitalize" style={{ fontSize: '0.75rem' }}>
                    {user.role} Account
                  </div>
                </div>
                <div className="vr d-none d-sm-block mx-1" style={{ height: '30px' }}></div>
                <button
                  className="btn btn-outline-danger btn-sm px-3 rounded-pill"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className="btn btn-link text-decoration-none fw-semibold text-dark shadow-none"
                  to="/login"
                >
                  Login
                </Link>
                <Link className="btn btn-primary px-4 rounded-pill" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
