import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [role, setRole] = useState('patient');

  // Doctor specific fields
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const defaultSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      role,
      contactInfo
    };

    if (role === 'doctor') {
      if (!specialization || !experience || !fees) {
        setError('Please fill out all required doctor fields.');
        setLoading(false);
        return;
      }

      // Structure availability list
      const availability = selectedDays.map((day) => ({
        day,
        slots: defaultSlots
      }));

      payload.specialization = specialization;
      payload.bio = bio;
      payload.experience = Number(experience);
      payload.fees = Number(fees);
      payload.availability = availability;
    }

    try {
      const res = await authService.register(payload);
      const { token, user, doctor } = res.data;

      // Store in local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (doctor) {
        localStorage.setItem('doctor', JSON.stringify(doctor));
      }

      // Route according to roles
      if (user.role === 'patient') {
        navigate('/dashboard/patient');
      } else if (user.role === 'doctor') {
        navigate('/dashboard/doctor');
      } else {
        navigate('/');
      }

      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center">
      <div className="card glass-card border-0 p-5 shadow-lg col-md-8 col-lg-7 animate-fade-in-up">
        <div className="text-center mb-4">
          <i className="bi bi-person-plus fs-1 text-primary"></i>
          <h2 className="fw-bold mt-2">Create Account</h2>
          <p className="text-muted small">Register as a patient or doctor practitioner</p>
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
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Dr. John Doe / Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
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
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
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
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold">Contact Info</label>
              <input
                type="text"
                className="form-control"
                placeholder="+1 234 567 890"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">I am registering as a</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {role === 'doctor' && (
            <div
              className="border-top pt-4 mt-4 animate-fade-in-up"
              style={{ borderStyle: 'dashed !important' }}
            >
              <h5 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
                <i className="bi bi-file-medical"></i> Doctor Profile Information
              </h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">Specialization</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cardiology, Pediatrics, General Medicine"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label small fw-semibold">Experience (Yrs)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                    min="0"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label small fw-semibold">Consultation Fee ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="100"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Professional Bio</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Provide a summary of your medical career and expertise..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold d-block">
                  Working Availability Days
                </label>
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
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fs-6 mb-3 mt-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center small text-muted mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
