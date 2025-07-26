import mongoose from 'mongoose';

const hospitalPricingSchema = new mongoose.Schema({
  specialty: {
    type: String,
    required: true,
    unique: true,
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
hospitalPricingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('HospitalPricing', hospitalPricingSchema); 