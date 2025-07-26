// models/doctor.js
import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialty: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  about: { type: String, required: true },
  fees: { type: Number, default: 0 }, // Made optional with default value
  address: { type: String, required: true },
  image: { type: String, required: true },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
  },
  availability: [
    {
      day: { type: String, required: true },
      isAvailable: { type: Boolean, default: false },
      timeSlots: [
        {
          startTime: { type: String },
          endTime: { type: String },
          maxPatients: { type: Number, default: 4 },
        },
      ],
    },
  ],
  offDays: [{ type: String }],
  maxAppointmentsPerDay: { type: Number, default: 20 },
  createdAt: { type: Date, default: Date.now },
});

// Virtual field to calculate available slots
doctorSchema.virtual('availableSlots').get(function() {
  if (!this.availability) return 0;
  
  let totalSlots = 0;
  this.availability.forEach(day => {
    if (day.isAvailable && day.timeSlots) {
      day.timeSlots.forEach(slot => {
        if (slot.startTime && slot.endTime && slot.maxPatients) {
          totalSlots += slot.maxPatients;
        }
      });
    }
  });
  
  return totalSlots;
});

// Ensure virtual fields are serialized
doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.set('toObject', { virtuals: true });

export default mongoose.model('Doctor', doctorSchema);