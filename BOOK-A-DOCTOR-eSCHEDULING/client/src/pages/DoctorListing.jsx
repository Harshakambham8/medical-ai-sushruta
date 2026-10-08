import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../services/api';

const DoctorListing = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getDoctors(search, specialization);
        setDoctors(res.data.data);
      } catch (err) {
        setError('Failed to load doctors list. Please check connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input by 300ms
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, specialization]);

  const specializations = [
    'Cardiology',
    'Pediatrics',
    'Dermatology',
    'General Medicine',
    'Neurology',
    'Orthopedics',
    'Psychiatry',
    'Gynecology'
  ];

  return (
    <div className="container py-5">
      <div className="text-center mb-5 animate-fade-in-up">
        <h1 className="fw-bold mb-2">Find a Medical Specialist</h1>
        <p className="text-muted">
          Browse profiles and reserve slots with approved healthcare professionals.
        </p>
      </div>

      {/* Filter and Search Section */}
      <div className="row g-3 mb-5 p-4 glass-card shadow-sm border-0 animate-fade-in-up">
        <div className="col-md-7">
          <div className="input-group">
            <span
              className="input-group-text bg-white border-end-0"
              style={{
                borderRadius: '12px 0 0 12px',
                borderColor: 'rgba(88, 80, 236, 0.15)'
              }}
            >
              <i className="bi bi-search text-primary"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              style={{ borderRadius: '0 12px 12px 0' }}
              placeholder="Search doctors by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-5">
          <select
            className="form-select"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger text-center border-0 rounded-3 shadow-sm"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: '3rem', height: '3rem' }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-5 glass-card border-0">
          <i className="bi bi-emoji-frown fs-1 text-muted"></i>
          <h4 className="fw-bold text-muted mt-3">No Doctors Found</h4>
          <p className="text-muted small">Try refining your search terms or specialization.</p>
        </div>
      ) : (
        <div className="row g-4 animate-fade-in-up">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="col-md-6 col-lg-4">
              <div className="card glass-card h-100 border-0 shadow-sm p-4 text-center d-flex flex-column">
                <div
                  className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '70px',
                    height: '70px',
                    backgroundColor: 'rgba(88, 80, 236, 0.08)',
                    color: 'var(--primary-color)'
                  }}
                >
                  <i className="bi bi-person-fill-gear fs-2"></i>
                </div>

                <h4 className="fw-bold mb-1 text-dark">{doctor.user?.name}</h4>
                <div className="mb-2">
                  <span className="spec-badge">{doctor.specialization}</span>
                </div>

                <p
                  className="text-muted small mb-4 text-start"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.5',
                    height: '4.5em'
                  }}
                >
                  {doctor.bio || 'No professional biography has been added by this doctor yet.'}
                </p>

                <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                  <div className="text-start">
                    <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Experience</div>
                    <div className="fw-bold text-dark">{doctor.experience} Years</div>
                  </div>
                  <div className="text-end">
                    <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Consultation Fee</div>
                    <div className="fw-bold text-success">${doctor.fees}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/doctors/${doctor._id}`}
                    className="btn btn-primary w-100 rounded-pill py-2"
                  >
                    View Details & Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorListing;
