import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

// @desc    Get all pending doctors
// @route   GET /api/admin/pending-doctors
// @access  Private (Admin only)
export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: false }).populate({
      path: 'user',
      select: 'name email contactInfo'
    });
    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve or reject doctor registration
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private (Admin only)
export const toggleDoctorApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    doctor.isApproved = isApproved;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: `Doctor '${doctor.user.name}' has been ${isApproved ? 'approved' : 'disapproved'}.`,
      data: doctor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users in the system
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a user and cascade details
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cascade delete related records
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        // Delete appointments related to doctor
        await Appointment.deleteMany({ doctor: doctor._id });
        // Delete doctor record
        await Doctor.findByIdAndDelete(doctor._id);
      }
    } else if (user.role === 'patient') {
      // Delete appointments booked by patient
      await Appointment.deleteMany({ patient: user._id });
    }

    // Delete base user record
    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      success: true,
      message: 'User and all associated records have been deleted.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    const patientCount = await User.countDocuments({ role: 'patient' });
    const approvedDoctorCount = await Doctor.countDocuments({ isApproved: true });
    const pendingDoctorCount = await Doctor.countDocuments({ isApproved: false });
    const totalAppointments = await Appointment.countDocuments();
    
    // Status breakdown
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    return res.status(200).json({
      success: true,
      data: {
        patients: patientCount,
        approvedDoctors: approvedDoctorCount,
        pendingDoctors: pendingDoctorCount,
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          cancelled: cancelledAppointments
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
