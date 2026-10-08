import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user (patient or doctor)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      contactInfo,
      specialization,
      bio,
      experience,
      fees,
      availability
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create standard user account
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      contactInfo: contactInfo || ''
    });

    let doctorDetails = null;

    // If role is doctor, create the associated Doctor profile
    if (role === 'doctor') {
      if (!specialization || experience === undefined || fees === undefined) {
        // Rollback user creation
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Doctors must provide specialization, experience, and fees'
        });
      }

      doctorDetails = await Doctor.create({
        user: user._id,
        specialization,
        bio: bio || '',
        experience,
        fees,
        availability: availability || [],
        isApproved: false // Initial registration starts as unapproved
      });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactInfo: user.contactInfo
      },
      doctor: doctorDetails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    let doctorDetails = null;
    if (user.role === 'doctor') {
      doctorDetails = await Doctor.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactInfo: user.contactInfo
      },
      doctor: doctorDetails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let doctorDetails = null;

    if (user.role === 'doctor') {
      doctorDetails = await Doctor.findOne({ user: user.id });
    }

    return res.status(200).json({
      success: true,
      user,
      doctor: doctorDetails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
