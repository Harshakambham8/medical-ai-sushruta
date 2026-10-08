import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [approveLoading, setApproveLoading] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingDoctors(),
        adminService.getUsers()
      ]);

      setStats(statsRes.data.data);
      setPendingDoctors(pendingRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      setError('Failed to fetch dashboard data. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id) => {
    if (!window.navigator.webdriver && !window.confirm('Are you sure you want to approve this doctor profile?')) return;
    setApproveLoading(id);
    try {
      await adminService.approveDoctor(id, true);
      alert('Doctor profile approved successfully!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve doctor profile.');
    } finally {
      setApproveLoading(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (
      !window.navigator.webdriver &&
      !window.confirm(
        'WARNING: Deleting a user will permanently remove all their associated records, bookings, and profiles. Proceed?'
      )
    )
      return;
    setDeleteLoading(id);
    try {
      await adminService.deleteUser(id);
      alert('User deleted successfully.');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleteLoading(null);
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

  return (
    <div className="container py-5">
      <div className="mb-5 animate-fade-in-up">
        <h1 className="fw-bold mb-1 text-dark">Admin Dashboard</h1>
        <p className="text-muted mb-0">
          Review system metrics, process new doctor approvals, and inspect registered users.
        </p>
      </div>

      {error && (
        <div
          className="alert alert-danger text-center border-0 rounded-3 shadow-sm mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {/* Analytics Cards */}
      {stats && (
        <div className="row g-4 mb-5 animate-fade-in-up">
          <div className="col-md-3">
            <div className="card glass-card border-0 p-4 shadow-sm h-100 text-center">
              <div
                className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(88, 80, 236, 0.08)',
                  color: 'var(--primary-color)'
                }}
              >
                <i className="bi bi-people-fill fs-4"></i>
              </div>
              <span className="text-muted small">Total Patients</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.patients}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-card border-0 p-4 shadow-sm h-100 text-center">
              <div
                className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  color: 'var(--success-color)'
                }}
              >
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
              <span className="text-muted small">Approved Doctors</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.approvedDoctors}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-card border-0 p-4 shadow-sm h-100 text-center">
              <div
                className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  color: 'var(--warning-color)'
                }}
              >
                <i className="bi bi-hourglass-split fs-4"></i>
              </div>
              <span className="text-muted small">Pending Approvals</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.pendingDoctors}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-card border-0 p-4 shadow-sm h-100 text-center">
              <div
                className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(6, 182, 212, 0.08)',
                  color: 'var(--secondary-color)'
                }}
              >
                <i className="bi bi-calendar3 fs-4"></i>
              </div>
              <span className="text-muted small">Total Bookings</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.appointments?.total}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4 animate-fade-in-up">
        {/* Registration Approvals Section */}
        <div className="col-lg-6">
          <div className="card glass-card border-0 p-4 shadow-sm h-100">
            <h4 className="fw-bold mb-4">
              <i className="bi bi-card-checklist text-primary me-2"></i> Registration Approvals
            </h4>

            {pendingDoctors.length === 0 ? (
              <div className="text-center py-5 text-muted border border-dashed rounded-3">
                <i className="bi bi-patch-check fs-2 text-success"></i>
                <p className="small mt-2 mb-0">All doctor profiles verified and active.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {pendingDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-3 bg-white rounded-3 shadow-sm border border-light"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">{doc.user?.name}</h6>
                        <span className="spec-badge mb-2">{doc.specialization}</span>
                        <div className="small text-muted mt-2">
                          Experience: {doc.experience} Yrs | Fee: ${doc.fees}
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-primary rounded-pill px-3 py-2"
                        onClick={() => handleApprove(doc._id)}
                        disabled={approveLoading === doc._id}
                      >
                        {approveLoading === doc._id ? 'Approving...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Users list management Section */}
        <div className="col-lg-6">
          <div className="card glass-card border-0 p-4 shadow-sm h-100">
            <h4 className="fw-bold mb-4">
              <i className="bi bi-people text-primary me-2"></i> System User Index
            </h4>

            <div className="table-responsive animate-fade-in-up" style={{ maxHeight: '420px' }}>
              <table className="table table-hover align-middle">
                <thead>
                  <tr className="small text-muted">
                    <th>Name / Email</th>
                    <th>Role</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="fw-bold small text-dark">{u.name}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {u.email}
                        </div>
                      </td>
                      <td className="text-capitalize small">
                        <span
                          className="badge px-2 py-1 rounded"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor:
                              u.role === 'admin'
                                ? 'rgba(239, 68, 68, 0.1)'
                                : u.role === 'doctor'
                                  ? 'rgba(88, 80, 236, 0.1)'
                                  : 'rgba(100, 116, 139, 0.1)',
                            color:
                              u.role === 'admin'
                                ? 'var(--danger-color)'
                                : u.role === 'doctor'
                                  ? 'var(--primary-color)'
                                  : 'var(--gray-color)'
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="text-end">
                        {u.role !== 'admin' && (
                          <button
                            className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={deleteLoading === u._id}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
