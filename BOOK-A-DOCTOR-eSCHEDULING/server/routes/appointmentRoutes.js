import express from 'express';
import { bookAppointment, getMyAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All appointment routes require authentication
router.use(protect);

// Patients can book appointments with file attachments (optional)
router.post('/', restrictTo('patient'), upload.single('document'), bookAppointment);

// Retrieve appointments list (filters automatically based on patient/doctor/admin role)
router.get('/', getMyAppointments);

// Update appointment status (accept, reject, or cancel)
router.put('/:id/status', updateAppointmentStatus);

export default router;
