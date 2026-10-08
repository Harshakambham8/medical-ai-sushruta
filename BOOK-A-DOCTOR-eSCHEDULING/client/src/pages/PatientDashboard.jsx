import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/api';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.data.data);
    } catch (err) {
      setError('Failed to fetch appointments list. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    setCancelLoading(id);
    try {
      await appointmentService.updateStatus(id, 'cancelled');
      setConfirmCancelId(null);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelLoading(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'pending') return 'status-pending';
    if (status === 'confirmed') return 'status-confirmed';
    return 'status-cancelled';
  };

  const serverURL = 'http://localhost:5000';

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-5 animate-fade-in-up">
        <div>
          <h1 className="fw-bold mb-1 text-dark">Patient Dashboard</h1>
          <p className="text-muted mb-0">
            Monitor appointments, reports, and review consultation statuses.
          </p>
        </div>
        <div
          className="text-white px-4 py-3 rounded-4 shadow-sm text-end"
          style={{
            background: 'linear-gradient(135deg, var(--primary-color) 0%, #4338ca 100%)'
          }}
        >
          <div className="small text-white-50">Total Bookings</div>
          <h3 className="fw-bold mb-0">{appointments.length}</h3>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger text-center border-0 rounded-3 shadow-sm mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-5 glass-card border-0 animate-fade-in-up">
          <i className="bi bi-calendar-x fs-1 text-muted"></i>
          <h4 className="fw-bold text-muted mt-3">No Appointments Yet</h4>
          <p className="text-muted small">Reserve a slot to begin your scheduling history.</p>
        </div>
      ) : (
        <div className="row g-4 animate-fade-in-up">
          {appointments.map((appt) => (
            <div key={appt._id} className="col-md-6 col-lg-4">
              <div className="card glass-card border-0 shadow-sm p-4 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">
                      Dr. {appt.doctor?.user?.name || 'Doctor Practitioner'}
                    </h5>
                    <span className="spec-badge mb-2">{appt.doctor?.specialization}</span>
                  </div>
                  <span className={`status-badge text-capitalize ${getStatusClass(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>

                <div className="mb-3 py-2 px-3 bg-white rounded-3 border border-light">
                  <div className="small text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                    <i className="bi bi-clock-fill me-1 text-primary"></i> Date & Slot
                  </div>
                  <strong className="text-dark" style={{ fontSize: '0.9rem' }}>
                    {appt.date} at {appt.timeSlot}
                  </strong>
                </div>

                {appt.notes && (
                  <div className="mb-3">
                    <span className="small text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>
                      Visit Reason / Remarks:
                    </span>
                    <p
                      className="small text-dark mb-0 bg-light p-2 rounded-3"
                      style={{
                        maxHeight: '75px',
                        overflowY: 'auto',
                        border: '1px solid rgba(88, 80, 236, 0.05)'
                      }}
                    >
                      {appt.notes}
                    </p>
                  </div>
                )}

                {appt.documentPath && (
                  <div className="mb-3 mt-auto">
                    <span className="small text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>
                      Submitted Reports:
                    </span>
                    <a
                      href={`${serverURL}/${appt.documentPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-center text-primary text-decoration-none small p-2 rounded-3 border border-light"
                      style={{
                        backgroundColor: 'rgba(88, 80, 236, 0.05)',
                        fontWeight: '500'
                      }}
                    >
                      <i className="bi bi-file-earmark-medical fs-5 me-2"></i>
                      <span className="text-truncate" style={{ maxWidth: '180px' }}>
                        {appt.documentName || 'View Attachment'}
                      </span>
                      <i className="bi bi-box-arrow-up-right ms-auto"></i>
                    </a>
                  </div>
                )}

                <div className="mt-auto pt-3">
                  {appt.status !== 'cancelled' ? (
                    confirmCancelId === appt._id ? (
                      <div className="p-3 bg-light rounded-3 border border-danger text-center animate-fade-in-up">
                        <div className="small text-danger fw-semibold mb-2">Cancel appointment?</div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-danger w-50 rounded-pill py-2"
                            onClick={() => handleCancel(appt._id)}
                            disabled={cancelLoading === appt._id}
                          >
                            {cancelLoading === appt._id ? 'Yes...' : 'Yes, Cancel'}
                          </button>
                          <button
                            className="btn btn-sm btn-light border w-50 rounded-pill py-2"
                            onClick={() => setConfirmCancelId(null)}
                            disabled={cancelLoading === appt._id}
                          >
                            No, Keep
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-outline-danger w-100 rounded-pill py-2"
                        onClick={() => setConfirmCancelId(appt._id)}
                      >
                        <i className="bi bi-x-circle me-1"></i> Cancel Booking
                      </button>
                    )
                  ) : (
                    <div
                      className="text-center text-muted small py-2 border rounded-pill"
                      style={{ backgroundColor: '#f8fafc' }}
                    >
                      Appointment Cancelled
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
