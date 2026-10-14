import mongoose from 'mongoose';

const encounterSchema = new mongoose.Schema(
  {
    encounterNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true, // One encounter per appointment
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'finalized', 'amended'],
      default: 'draft',
      index: true,
    },
    encounterDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Vitals
    vitals: {
      bloodPressureSys: { type: Number },
      bloodPressureDia: { type: Number },
      heartRate: { type: Number },
      temperature: { type: Number },
      respiratoryRate: { type: Number },
      oxygenSaturation: { type: Number },
      weightKg: { type: Number },
      heightCm: { type: Number },
      bmi: { type: Number },
    },
    // Chief Complaint & Symptoms
    chiefComplaint: {
      type: String,
      default: '',
    },
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    // Structured SOAP Clinical Notes
    soapNotes: {
      subjective: { type: String, default: '' },
      objective: { type: String, default: '' },
      assessment: { type: String, default: '' },
      plan: { type: String, default: '' },
    },
    // Diagnoses (ICD codes + descriptions)
    diagnoses: [
      {
        code: { type: String, required: true },
        description: { type: String, required: true },
        type: { type: String, enum: ['primary', 'secondary'], default: 'primary' },
        status: { type: String, enum: ['active', 'resolved', 'chronic'], default: 'active' },
      },
    ],
    // Follow-up recommendation
    followUpPlan: {
      recommendedDate: { type: Date },
      instructions: { type: String, default: '' },
      intervalWeeks: { type: Number },
    },
    // AI Clinician-Reviewed Summary
    aiSummary: {
      generatedText: { type: String, default: '' },
      status: {
        type: String,
        enum: ['none', 'unapproved_draft', 'approved_by_clinician', 'rejected'],
        default: 'none',
      },
      approvedAt: { type: Date },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    // Immutability / Signing
    finalizedAt: {
      type: Date,
    },
    finalizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    amendmentReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Encounter = mongoose.model('Encounter', encounterSchema);
