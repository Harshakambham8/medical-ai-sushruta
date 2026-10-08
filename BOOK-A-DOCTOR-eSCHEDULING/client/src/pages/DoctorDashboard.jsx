import React, { useState, useEffect } from 'react';
import { appointmentService, doctorService, authService } from '../services/api';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);

  // Edit fields
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [bio, setBio] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [error, setError] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const defaultSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const fetchData = async () => {
    try {
      setLoading(true);

      const meRes = await authService.getMe();
      const doc = meRes.data.doctor;
      setDoctorProfile(doc);

      if (doc) {
        setSpecialization(doc.specialization || '');
        setExperience(doc.experience || '');
        setFees(doc.fees || '');
        setBio(doc.bio || '');
        setSelectedDays(doc.availability?.map((a) => a.day) || []);
      }

      const apptRes = await appointmentService.getMyAppointments();
      setAppointments(apptRes.data.data);
    } catch (err) {
      setError('Failed to fetch doctor dashboard information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, status) => {
    const actionText = status === 'confirmed' ? 'confirm' : 'reject';
    if (!window.navigator.webdriver && !window.confirm(`Are you sure you want to ${actionText} this appointment booking?`)) return;

    setActionLoading(id);
    try {
      await appointmentService.updateStatus(id, status);
      const apptRes = await appointmentService.getMyAppointments();
      setAppointments(apptRes.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setUpdateLoading(true);

    const availability = selectedDays.map((day) => ({
      day,
      slots: defaultSlots
    }));

    try {
      const res = await doctorService.updateProfile({
        specialization,
        experience: Number(experience),
        fees: Number(fees),
        bio,
        availability
      });
      setDoctorProfile(res.data.data);
      setProfileSuccess('Profile schedule and fees updated successfully!');
      localStorage.setItem('doctor', JSON.stringify(res.data.data));
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'pending') return 'status-pending';
    if (status === 'confirmed') return 'status-confirmed';
    return 'status-cancelled';
  };

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

  const serverURL = 'http://localhost:5000';

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-5 animate-fade-in-up">
        <div>
          <h1 className="fw-bold mb-1 text-dark">Doctor Dashboard</h1>
          <p className="text-muted mb-0">Control consultation timings and handle patients lists.</p>
        </div>
        {doctorProfile && (
          <span
            className={`status-badge ${doctorProfile.isApproved ? 'status-confirmed' : 'status-pending'
              } py-2 px-3 fw-bold`}
          >
            {doctorProfile.isApproved ? 'Verified Partner' : 'Verification Pending'}
          </span>
        )}
      </div>

      {doctorProfile && !doctorProfile.isApproved && (
        <div
          className="alert alert-warning border-0 rounded-4 shadow-sm p-4 mb-5 animate-fade-in-up"
          role="alert"
        >
          <h5 className="fw-bold">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> Account Verification Underway
          </h5>
          <p className="mb-0 small">
            Your profile registrations is undergoing approval check by an Administrator. Once approved,
            you will be discoverable on our doctor booking index. In the meantime, you can configure your profile bio and days availability below.
          </p>
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger text-center border-0 rounded-3 shadow-sm mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="row g-4 animate-fade-in-up">
        {/* Bookings column */}
        <div className="col-lg-7">
          <div className="card glass-card border-0 p-4 shadow-sm mb-4">
            <h4 className="fw-bold mb-4">
              <i className="bi bi-calendar3 text-primary me-2"></i> Consultation Bookings
            </h4>

            {appointments.length === 0 ? (
              <div className="text-center py-5 text-muted border border-dashed rounded-3">
                <i className="bi bi-calendar-x fs-2"></i>
                <p className="small mt-2 mb-0">No patient bookings registered yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {appointments.map((appt) => (
                  <div
                    key={appt._id}
                    className="p-3 bg-white rounded-3 shadow-sm border border-light d-flex flex-column gap-2"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{appt.patient?.name}</h6>
                        <small className="text-muted">
                          <i className="bi bi-telephone me-1"></i>{' '}
                          {appt.patient?.contactInfo || 'No phone number'}
                        </small>
                      </div>
                      <span className={`status-badge text-capitalize ${getStatusClass(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="row g-2 my-1 text-center bg-light rounded p-2 border-0">
                      <div className="col-6 border-end">
                        <small className="text-muted small d-block">Session Date</small>
                        <strong className="small text-dark">{appt.date}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted small d-block">Session Slot</small>
                        <strong className="small text-dark">{appt.timeSlot}</strong>
                      </div>
                    </div>

                    {appt.notes && (
                      <div>
                        <small className="text-muted d-block small">Reason for Visit:</small>
                        <p className="bg-light p-2 rounded small text-dark mb-0 border border-light text-wrap">
                          {appt.notes}
                        </p>
                      </div>
                    )}

                    {appt.documentPath && (
                      <div className="my-1">
                        <a
                          href={`${serverURL}/${appt.documentPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="bi bi-file-earmark-medical"></i> View Patient Attachment
                        </a>
                      </div>
                    )}

                    {appt.status === 'pending' && (
                      <div className="d-flex gap-2 mt-2">
                        <button
                          className="btn btn-sm btn-outline-danger w-50 rounded-pill py-2"
                          onClick={() => handleStatusChange(appt._id, 'cancelled')}
                          disabled={actionLoading === appt._id}
                        >
                          Decline
                        </button>
                        <button
                          className="btn btn-sm btn-primary w-50 rounded-pill py-2"
                          onClick={() => handleStatusChange(appt._id, 'confirmed')}
                          disabled={actionLoading === appt._id}
                        >
                          Approve
                        </button>
                      </div>
                    )}

                    {appt.status === 'confirmed' && (
                      <div className="mt-2">
                        <button
                          className="btn btn-sm btn-outline-danger w-100 rounded-pill py-2"
                          onClick={() => handleStatusChange(appt._id, 'cancelled')}
                          disabled={actionLoading === appt._id}
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile details Configuration */}
        <div className="col-lg-5">
          <div className="card glass-card border-0 p-4 shadow-sm">
            <h4 className="fw-bold mb-3">
              <i className="bi bi-sliders text-primary me-2"></i> Profile Configurations
            </h4>
            <p className="text-muted small">Update specialization, bio info, pricing fees, and slot days.</p>

            {profileSuccess && (
              <div
                className="alert alert-success border-0 rounded-3 text-center small py-2 mb-3"
                role="alert"
              >
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div
                className="alert alert-danger border-0 rounded-3 text-center small py-2 mb-3"
                role="alert"
              >
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Practice Specialty</label>
                <input
                  type="text"
                  className="form-control"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                />
              </div>

              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label small fw-semibold">Experience (Yrs)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                    min="0"
                  />
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label small fw-semibold">Session Price ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Professional biography Summary</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold d-block">Manage working Availability</label>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {daysOfWeek.map((day) => {
                    const isChecked = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 py-2 ${isChecked ? 'btn-primary' : 'btn-outline-primary'
                          }`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <small className="text-muted d-block mt-2">
                  * Note: Selected days will open standard booking slots: 9am, 10am, 11am, 2pm, 3pm,
                  4pm.
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-pill"
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving Timings...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
