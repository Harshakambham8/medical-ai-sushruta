import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService } from '../services/api';

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await doctorService.getDoctorById(id);
        setDoctor(res.data.data);
      } catch (err) {
        setError('Failed to fetch doctor details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div
        className="container py-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger border-0 rounded-3 shadow-sm py-3" role="alert">
          {error || 'Doctor profile not found.'}
        </div>
        <Link to="/doctors" className="btn btn-primary mt-3 rounded-pill px-4">
          Back to Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row g-4 animate-fade-in-up">
        {/* Doctor Main Info Section */}
        <div className="col-lg-8">
          <div className="card glass-card border-0 p-5 shadow-lg mb-4">
            <div className="d-flex align-items-center mb-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center me-4"
                style={{
                  width: '90px',
                  height: '90px',
                  minWidth: '90px',
                  backgroundColor: 'rgba(88, 80, 236, 0.08)',
                  color: 'var(--primary-color)'
                }}
              >
                <i className="bi bi-person-badge fs-1"></i>
              </div>
              <div>
                <h2 className="fw-bold mb-1 text-dark">{doctor.user?.name}</h2>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className="spec-badge">{doctor.specialization}</span>
                  <span
                    className="badge px-3 py-2 rounded-pill fw-semibold"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: 'var(--success-color)'
                    }}
                  >
                    <i className="bi bi-patch-check-fill me-1"></i> Verified Practitioner
                  </span>
                </div>
                <div className="text-muted small">
                  <i className="bi bi-envelope me-1"></i> {doctor.user?.email}
                </div>
                {doctor.user?.contactInfo && (
                  <div className="text-muted small mt-1">
                    <i className="bi bi-telephone me-1"></i> {doctor.user?.contactInfo}
                  </div>
                )}
              </div>
            </div>

            <h5 className="fw-bold mb-3 border-bottom pb-2">Biography</h5>
            <p className="text-muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>
              {doctor.bio || 'This medical professional has not provided a biography description.'}
            </p>

            <h5 className="fw-bold mb-3 border-bottom pb-2 pt-3">Practice Details</h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="p-3 bg-white rounded-3 shadow-sm border border-light">
                  <span className="text-muted small d-block mb-1">Clinical Practice</span>
                  <strong className="fs-5 text-dark">{doctor.experience} Years</strong>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="p-3 bg-white rounded-3 shadow-sm border border-light">
                  <span className="text-muted small d-block mb-1">Consultation Charge</span>
                  <strong className="fs-5 text-success">${doctor.fees} per session</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Availability sidebar */}
        <div className="col-lg-4">
          <div
            className="card glass-card border-0 p-4 shadow-lg position-sticky"
            style={{ top: '100px' }}
          >
            <h4 className="fw-bold mb-3">
              <i className="bi bi-clock text-primary me-2"></i> Weekly Schedule
            </h4>
            <p className="text-muted small mb-4">
              Review working days and slot hours to organize your booking appointment.
            </p>

            <div className="my-3">
              {doctor.availability && doctor.availability.length > 0 ? (
                doctor.availability.map((avail, index) => (
                  <div
                    key={index}
                    className="mb-3 p-3 bg-white rounded-3 shadow-sm border border-light"
                  >
                    <div className="fw-bold text-primary mb-2">
                      <i className="bi bi-calendar-check-fill me-2"></i> {avail.day}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {avail.slots.map((slot, sIdx) => (
                        <span
                          key={sIdx}
                          className="badge bg-light text-dark border px-2 py-1 rounded small"
                          style={{ fontSize: '0.75rem', fontWeight: '500' }}
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-white rounded-3 border border-dashed text-muted">
                  <i className="bi bi-calendar-x fs-2"></i>
                  <p className="small mt-2 mb-0">No active hours set.</p>
                </div>
              )}
            </div>

            <Link
              to={`/book/${doctor._id}`}
              state={{ doctorName: doctor.user?.name, specialization: doctor.specialization }}
              className="btn btn-primary w-100 py-3 rounded-pill fw-bold"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
