import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    actorName: {
      type: String,
      default: 'System',
    },
    actorRole: {
      type: String,
      default: 'system',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true, // e.g. "AUTH_LOGIN", "NOTE_FINALIZED", "LAB_RESULT_RELEASED", "PAYMENT_RECORDED"
    },
    resourceType: {
      type: String,
      required: true,
      index: true, // "Patient", "Encounter", "LaboratoryOrder", "Invoice", "User"
    },
    resourceId: {
      type: String,
      index: true,
    },
    outcome: {
      type: String,
      enum: ['success', 'failure', 'denied'],
      default: 'success',
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only!
  }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
