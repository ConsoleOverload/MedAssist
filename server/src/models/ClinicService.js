import mongoose from 'mongoose';

const clinicServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Service code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['consultation', 'procedure', 'lab', 'imaging', 'nursing', 'therapy'],
      default: 'consultation',
      index: true,
    },
    fee: {
      type: Number,
      required: [true, 'Fee is required'],
      min: 0,
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 5,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ClinicService = mongoose.model('ClinicService', clinicServiceSchema);
