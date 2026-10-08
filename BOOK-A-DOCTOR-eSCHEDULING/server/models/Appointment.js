import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: [true, 'Please provide an appointment date']
  },
  timeSlot: {
    type: String, // format "09:00 AM"
    required: [true, 'Please provide a time slot']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  documentPath: {
    type: String,
    default: ''
  },
  documentName: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index to facilitate fast searches for double booking
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: false });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
