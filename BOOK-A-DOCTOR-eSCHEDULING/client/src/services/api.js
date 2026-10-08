import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Automatically inject JWT token into requests if it exists in local storage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me')
};

export const doctorService = {
  getDoctors: (search = '', specialization = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (specialization) params.append('specialization', specialization);
    return API.get(`/doctors?${params.toString()}`);
  },
  getDoctorById: (id) => API.get(`/doctors/${id}`),
  updateProfile: (profileData) => API.put('/doctors/profile', profileData)
};

export const appointmentService = {
  // formData handles multipart/form-data for file uploads
  bookAppointment: (formData) => API.post('/appointments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getMyAppointments: () => API.get('/appointments'),
  updateStatus: (id, status) => API.put(`/appointments/${id}/status`, { status })
};

export const adminService = {
  getPendingDoctors: () => API.get('/admin/pending-doctors'),
  approveDoctor: (id, isApproved) => API.put(`/admin/doctors/${id}/approve`, { isApproved }),
  getUsers: () => API.get('/admin/users'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getStats: () => API.get('/admin/stats')
};

export default API;
