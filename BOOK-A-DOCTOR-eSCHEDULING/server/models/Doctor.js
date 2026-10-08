import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  slots: {
    type: [String], // E.g., ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]
    required: true
  }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Please provide a specialization'],
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  experience: {
    type: Number,
    required: [true, 'Please provide years of experience'],
    min: [0, 'Experience cannot be negative']
  },
  fees: {
    type: Number,
    required: [true, 'Please provide consultation fees'],
    min: [0, 'Fees cannot be negative']
  },
  availability: {
    type: [availabilitySchema],
    default: []
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
