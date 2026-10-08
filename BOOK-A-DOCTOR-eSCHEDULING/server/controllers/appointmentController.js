import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, notes } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctor, date, and time slot'
      });
    }

    // Verify doctor exists and is approved
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found or has not been approved by Admin.'
      });
    }

    // Validate that the slot is not already booked
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for this doctor. Please select another slot.'
      });
    }

    // Set up file path if document is uploaded
    let documentPath = '';
    let documentName = '';
    if (req.file) {
      // Normalize slashes for Windows compatibility
      documentPath = req.file.path.replace(/\\/g, '/');
      documentName = req.file.originalname;
    }

    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: req.user.id,
      date,
      timeSlot,
      notes: notes || '',
      documentPath,
      documentName
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: appointment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private (Admin, Patient, Doctor)
export const getMyAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patient: req.user.id })
        .populate({
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'name email contactInfo'
          }
        })
        .sort({ date: 1, timeSlot: 1 });
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }
      appointments = await Appointment.find({ doctor: doctor._id })
        .populate('patient', 'name email contactInfo')
        .sort({ date: 1, timeSlot: 1 });
    } else if (req.user.role === 'admin') {
      appointments = await Appointment.find()
        .populate({
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'name'
          }
        })
        .populate('patient', 'name email')
        .sort({ date: -1 });
    }

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update appointment status (Confirm / Cancel)
// @route   PUT /api/appointments/:id/status
// @access  Private (Patient / Doctor)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'confirmed' or 'cancelled'

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status can only be updated to confirmed or cancelled.'
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Role-based authorization check
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to manage appointments for this doctor account'
        });
      }
    } else if (req.user.role === 'patient') {
      if (appointment.patient.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this appointment'
        });
      }
      // Patients can only cancel appointments
      if (status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Patients are only permitted to cancel appointments.'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access.'
      });
    }

    appointment.status = status;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: `Appointment successfully updated to ${status}`,
      data: appointment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
