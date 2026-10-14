import mongoose from 'mongoose';

const testResultParameterSchema = new mongoose.Schema({
  parameter: { type: String, required: true }, // e.g., "Hemoglobin", "Fasting Glucose"
  value: { type: String, required: true }, // e.g., "14.2", "95"
  unit: { type: String, default: '' }, // e.g., "g/dL", "mg/dL"
  referenceRange: { type: String, default: '' }, // e.g., "13.8 - 17.2"
  flag: {
    type: String,
    enum: ['normal', 'abnormal', 'critical'],
    default: 'normal',
  },
});

const laboratoryOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    accessionNumber: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    encounterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Encounter',
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
    testName: {
      type: String,
      required: true,
    },
    testCode: {
      type: String,
      required: true, // e.g. "CBC", "LIPID", "LFT", "HbA1c"
    },
    category: {
      type: String,
      enum: ['Hematology', 'Biochemistry', 'Microbiology', 'Pathology', 'Immunology', 'Urinalysis'],
      default: 'Biochemistry',
    },
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine',
    },
    sampleType: {
      type: String,
      default: 'Blood (Serum)', // Blood, Urine, Swab, etc.
    },
    clinicalNotes: {
      type: String,
      default: '',
    },
    // Workflow state machine
    status: {
      type: String,
      enum: [
        'ordered',
        'sample_collected',
        'processing',
        'completed_pending_verification',
        'verified',
        'released',
        'cancelled',
        'rejected',
      ],
      default: 'ordered',
      index: true,
    },
    sampleCollectedAt: {
      type: Date,
    },
    sampleCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processingStartedAt: {
      type: Date,
    },
    technicianNotes: {
      type: String,
      default: '',
    },
    // Entered Test Results
    results: [testResultParameterSchema],
    resultsEnteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resultsEnteredAt: {
      type: Date,
    },
    // Clinical Verification (Separate step)
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    // Authorized Patient Release (Only after verification)
    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    releasedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const LaboratoryOrder = mongoose.model('LaboratoryOrder', laboratoryOrderSchema);
