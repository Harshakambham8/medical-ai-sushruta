import express from 'express';
import {
  getPendingDoctors,
  toggleDoctorApproval,
  getAllUsers,
  deleteUser,
  getDashboardStats
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Require authorization and restrict to Admins only
router.use(protect);
router.use(restrictTo('admin'));

router.get('/pending-doctors', getPendingDoctors);
router.put('/doctors/:id/approve', toggleDoctorApproval);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getDashboardStats);

export default router;
