import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    contactPerson: {
      type: String,
      trim: true
    },
    specialties: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    notificationHistory: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      type: {
        type: String,
        enum: ['low_stock', 'expiry', 'reorder', 'return'],
        required: true
      },
      medicines: [{
        name: String,
        stock: Number,
        reorderQuantity: Number,
        priority: String
      }],
      status: {
        type: String,
        enum: ['sent', 'delivered', 'failed'],
        default: 'sent'
      },
      response: {
        type: String,
        trim: true
      }
    }],
    lastContacted: {
      type: Date
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Index for efficient queries
SupplierSchema.index({ email: 1 });
SupplierSchema.index({ isActive: 1 });

// Method to add notification to history
SupplierSchema.methods.addNotification = function(type, medicines, status = 'sent', response = '') {
  this.notificationHistory.push({
    timestamp: new Date(),
    type,
    medicines,
    status,
    response
  });
  this.lastContacted = new Date();
  return this.save();
};

// Method to get recent notifications
SupplierSchema.methods.getRecentNotifications = function(limit = 10) {
  return this.notificationHistory
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

// Static method to get active suppliers
SupplierSchema.statics.getActiveSuppliers = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to get suppliers by specialty
SupplierSchema.statics.getSuppliersBySpecialty = function(specialty) {
  return this.find({ 
    isActive: true, 
    specialties: { $in: [specialty] } 
  }).sort({ name: 1 });
}; 

export default mongoose.model("Supplier", SupplierSchema); 