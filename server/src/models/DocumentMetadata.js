import mongoose from 'mongoose';

const documentMetadataSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['lab_report', 'prescription', 'clinical_note', 'invoice', 'insurance', 'external'],
      default: 'external',
      index: true,
    },
    fileKey: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accessLevel: {
      type: String,
      enum: ['clinical_only', 'patient_visible', 'admin_only'],
      default: 'patient_visible',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentMetadata = mongoose.model('DocumentMetadata', documentMetadataSchema);
