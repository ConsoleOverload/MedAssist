import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClinicService',
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'], // HH:mm
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'], // HH:mm
    },
    status: {
      type: String,
      enum: ['booked', 'arrived', 'in-consultation', 'completed', 'cancelled', 'no-show'],
      default: 'booked',
      index: true,
    },
    queueNumber: {
      type: Number,
      default: null,
    },
    reason: {
      type: String,
      default: 'General Consultation',
    },
    notes: {
      type: String,
      default: '',
    },
    checkInTime: {
      type: Date,
    },
    consultationStartTime: {
      type: Date,
    },
    completedTime: {
      type: Date,
    },
    cancelledTime: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for slot conflict prevention
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, startTime: 1, status: 1 },
  { name: 'doctor_schedule_conflict_idx' }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);
