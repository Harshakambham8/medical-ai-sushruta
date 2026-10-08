import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Get all approved doctors with optional search/filtering
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const { search, specialization } = req.query;
    
    // Base filter: only show approved doctors
    let query = { isApproved: true };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    let doctors = await Doctor.find(query).populate({
      path: 'user',
      select: 'name email contactInfo'
    });

    // Handle search by doctor name in JS side since name is nested in User
    if (search) {
      const searchLower = search.toLowerCase();
      doctors = doctors.filter(doc => 
        doc.user && doc.user.name.toLowerCase().includes(searchLower)
      );
    }

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

// @desc    Get single doctor profile details
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate({
      path: 'user',
      select: 'name email contactInfo'
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update logged-in doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
export const updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, bio, experience, fees, availability, name, contactInfo } = req.body;

    let doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Update Doctor profile properties
    if (specialization !== undefined) doctor.specialization = specialization;
    if (bio !== undefined) doctor.bio = bio;
    if (experience !== undefined) doctor.experience = experience;
    if (fees !== undefined) doctor.fees = fees;
    if (availability !== undefined) doctor.availability = availability;

    await doctor.save();

    // Also update parent User record name or contact info if provided
    if (name || contactInfo) {
      const user = await User.findById(req.user.id);
      if (user) {
        if (name) user.name = name;
        if (contactInfo) user.contactInfo = contactInfo;
        await user.save();
      }
    }

    const updatedDoctor = await Doctor.findOne({ user: req.user.id }).populate({
      path: 'user',
      select: 'name email contactInfo'
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedDoctor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
