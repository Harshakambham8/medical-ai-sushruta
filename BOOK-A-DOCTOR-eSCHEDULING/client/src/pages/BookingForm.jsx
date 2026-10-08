import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { doctorService, appointmentService } from '../services/api';

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [document, setDocument] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const doctorName = location.state?.doctorName;
  const specialization = location.state?.specialization;

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await doctorService.getDoctorById(id);
        setDoctor(res.data.data);
      } catch (err) {
        setError('Failed to load doctor profile. Check connectivity.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Dynamically resolve time slots when date selection changes
  useEffect(() => {
    if (!date || !doctor) {
      setAvailableSlots([]);
      setTimeSlot('');
      return;
    }

    const selectedDate = new Date(date);
    // getDay() is 0 (Sunday) to 6 (Saturday)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[selectedDate.getDay()];

    const schedule = doctor.availability?.find(
      (avail) => avail.day.toLowerCase() === dayName.toLowerCase()
    );

    if (schedule) {
      setAvailableSlots(schedule.slots);
      setError('');
    } else {
      setAvailableSlots([]);
      setTimeSlot('');
      setError(`Dr. ${doctor.user?.name} is not scheduled to work on ${dayName}s. Please choose another date.`);
    }
  }, [date, doctor]);

  const handleFileChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!date || !timeSlot) {
      setError('Please select a valid date and session slot.');
      return;
    }

    setBookingLoading(true);

    const formData = new FormData();
    formData.append('doctorId', id);
    formData.append('date', date);
    formData.append('timeSlot', timeSlot);
    formData.append('notes', notes);
    if (document) {
      formData.append('document', document);
    }

    try {
      await appointmentService.bookAppointment(formData);
      setSuccess('Appointment successfully requested!');
      setTimeout(() => {
        navigate('/dashboard/patient');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. This slot may already be reserved.');
    } finally {
      setBookingLoading(false);
    }
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

  // Get current date string for min date (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center">
      <div className="card glass-card border-0 p-5 shadow-lg col-md-8 col-lg-6 animate-fade-in-up">
        <div className="text-center mb-4">
          <i className="bi bi-calendar-plus fs-1 text-primary"></i>
          <h2 className="fw-bold mt-2 text-dark">Schedule Booking</h2>
          <p className="text-muted small">
            Reserving session with Dr. {doctor.user?.name || doctorName}
          </p>
          <span className="spec-badge">{doctor.specialization || specialization}</span>
        </div>

        {error && (
          <div
            className="alert alert-danger border-0 rounded-3 text-center small py-2 mb-3"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {success && (
          <div
            className="alert alert-success border-0 rounded-3 text-center small py-2 mb-3"
            role="alert"
          >
            <i className="bi bi-check-circle-fill me-2"></i> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Consultation Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              min={todayStr}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Choose Session Time</label>
            <select
              className="form-select"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              disabled={availableSlots.length === 0}
              required
            >
              <option value="">
                {availableSlots.length === 0
                  ? 'Choose an available working date first'
                  : 'Select an available hour slot'}
              </option>
              {availableSlots.map((slot, idx) => (
                <option key={idx} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Reason for Visit / Symptoms</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Describe symptoms, follow-up remarks, or physical health issues..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">
              Medical Reports / Prescriptions <span className="text-muted">(Optional)</span>
            </label>
            <input
              type="file"
              className="form-control"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
            <small className="text-muted d-block mt-1">
              Supports PDF, PNG, and JPEG files (Maximum size 5MB).
            </small>
          </div>

          <div className="d-flex gap-3">
            <Link
              to={`/doctors/${id}`}
              className="btn btn-light border w-50 py-2 rounded-pill fw-semibold"
            >
              Back
            </Link>
            <button
              type="submit"
              className="btn btn-primary w-50 py-2 rounded-pill"
              disabled={bookingLoading || availableSlots.length === 0}
            >
              {bookingLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </>
              ) : (
                'Request Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
