import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  startTime: String,
  endTime: String,
  maxPatients: {
    type: Number,
    default: 4,
  },
});

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  timeSlots: [timeSlotSchema],
});

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    specialty: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    available: {
      type: Number,
      default: true,
    },
    fees: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    slots_booked: {
      type: Object,
      default: {},
    },
    availability: [availabilitySchema],
    workingHours: {
      start: String,
      end: String,
    },
    offDays: [String],
    maxAppointmentsPerDay: {
      type: Number,
      default: 20,
    },
  },
  { minimize: false }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
