import mongoose from 'mongoose';

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6, // 0 = Sunday, 1 = Monday, etc.
    },
    startTime: {
      type: String,
      required: true,
      default: '09:00', // HH:mm
    },
    endTime: {
      type: String,
      required: true,
      default: '17:00',
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
      min: 15,
      max: 120,
    },
    breakStartTime: {
      type: String,
      default: '13:00',
    },
    breakEndTime: {
      type: String,
      default: '14:00',
    },
    maxPatientsPerDay: {
      type: Number,
      default: 16,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so one entry per doctor per day of week
doctorAvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

export const DoctorAvailability = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
