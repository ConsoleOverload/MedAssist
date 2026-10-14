import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    encounterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Encounter',
      required: true,
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
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g. "500 mg"
        frequency: { type: String, required: true }, // e.g. "Twice daily after meals"
        route: { type: String, default: 'Oral' }, // Oral, Topical, IV, etc.
        duration: { type: String, required: true }, // e.g. "7 days"
        quantity: { type: String, default: '14 tablets' },
        instructions: { type: String, default: '' },
      },
    ],
    generalInstructions: {
      type: String,
      default: '',
    },
    dietaryAdvice: {
      type: String,
      default: '',
    },
    // Feature B: AI Plain-Language Explanation for Patients
    plainLanguageExplanation: {
      text: { type: String, default: '' },
      generatedAt: { type: Date },
      disclaimer: {
        type: String,
        default:
          'This explanation is generated to assist patient understanding. It does not replace the doctor’s original prescription. Please consult your physician or pharmacist with any medication concerns.',
      },
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'discontinued'],
      default: 'active',
      index: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
