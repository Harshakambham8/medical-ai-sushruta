import express from 'express';
import { getDoctors, getDoctorById, updateDoctorProfile } from '../controllers/doctorController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/profile', protect, restrictTo('doctor'), updateDoctorProfile);

export default router;
