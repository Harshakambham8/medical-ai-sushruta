import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="container py-5">
      <div className="row align-items-center py-5">
        <div className="col-lg-6 mb-5 mb-lg-0 animate-fade-in-up">
          <span
            className="badge px-3 py-2 rounded-pill fw-semibold mb-3"
            style={{ backgroundColor: 'rgba(88, 80, 236, 0.12)', color: 'var(--primary-color)' }}
          >
            <i className="bi bi-shield-check me-1"></i> Secure e-Scheduling Platform
          </span>
          <h1
            className="display-4 fw-bold mb-4"
            style={{ letterSpacing: '-1.5px', lineHeight: '1.15' }}
          >
            Schedule Your Doctor Appointment <span className="gradient-text">Effortlessly</span>
          </h1>
          <p className="lead text-muted mb-4 fs-5" style={{ lineHeight: '1.7' }}>
            Welcome to BOOK A DOCTOR-eSCHEDULING. Connect with top-tier verified medical
            practitioners, manage your appointments, share records securely, and track your wellness
            journey from a unified portal.
          </p>
          <div className="d-flex flex-wrap gap-3">
            {user ? (
              user.role === 'patient' ? (
                <>
                  <Link to="/doctors" className="btn btn-primary btn-lg px-4 rounded-pill">
                    <i className="bi bi-search me-2"></i> Find Doctors
                  </Link>
                  <Link
                    to="/dashboard/patient"
                    className="btn btn-outline-primary btn-lg px-4 rounded-pill"
                  >
                    <i className="bi bi-calendar3 me-2"></i> My Appointments
                  </Link>
                </>
              ) : user.role === 'doctor' ? (
                <Link to="/dashboard/doctor" className="btn btn-primary btn-lg px-4 rounded-pill">
                  <i className="bi bi-calendar-check me-2"></i> Doctor Dashboard
                </Link>
              ) : (
                <Link to="/dashboard/admin" className="btn btn-primary btn-lg px-4 rounded-pill">
                  <i className="bi bi-speedometer2 me-2"></i> Admin Panel
                </Link>
              )
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg px-4 rounded-pill">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline-primary btn-lg px-4 rounded-pill">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="col-lg-6 ps-lg-5 text-center animate-fade-in-up">
          <div
            className="glass-card p-5 shadow-lg position-relative border-0 rounded-4 overflow-hidden"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            <div className="p-4 bg-white rounded-3 shadow-sm d-flex align-items-center mb-4">
              <div
                className="text-white p-3 rounded-3 me-3"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-color) 0%, #4338ca 100%)'
                }}
              >
                <i className="bi bi-patch-check-fill fs-4"></i>
              </div>
              <div className="text-start">
                <h5 className="mb-0 fw-bold">Verified Professionals</h5>
                <small className="text-muted">Only approved medical staff</small>
              </div>
            </div>

            <div className="p-4 bg-white rounded-3 shadow-sm d-flex align-items-center mb-4">
              <div
                className="text-white p-3 rounded-3 me-3"
                style={{
                  background: 'linear-gradient(135deg, var(--secondary-color) 0%, #0891b2 100%)'
                }}
              >
                <i className="bi bi-cloud-upload-fill fs-4"></i>
              </div>
              <div className="text-start">
                <h5 className="mb-0 fw-bold">Secure File Sharing</h5>
                <small className="text-muted">Prescriptions and reports stored safely</small>
              </div>
            </div>

            <div className="p-4 bg-white rounded-3 shadow-sm d-flex align-items-center">
              <div
                className="text-white p-3 rounded-3 me-3"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-color) 0%, #db2777 100%)'
                }}
              >
                <i className="bi bi-clock-history fs-4"></i>
              </div>
              <div className="text-start">
                <h5 className="mb-0 fw-bold">Real-time Scheduling</h5>
                <small className="text-muted">No double-bookings guaranteed</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
