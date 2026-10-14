import { Prescription } from '../models/Prescription.js';
import { explainPrescriptionInstructions } from '../services/aiService.js';
import { recordAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { Patient } from '../models/Patient.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listPrescriptions = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      if (!req.user.patientId) return sendSuccess(res, []);
      query.patientId = req.user.patientId;
    } else {
      if (patientId) query.patientId = patientId;
      if (doctorId) query.doctorId = doctorId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'firstName lastName mrn dateOfBirth gender')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('encounterId', 'encounterNumber encounterDate')
      .sort({ createdAt: -1 });

    return sendSuccess(res, prescriptions);
  } catch (error) {
    next(error);
  }
};

export const createPrescription = async (req, res, next) => {
  try {
    const { encounterId, patientId, doctorId, medications, generalInstructions, dietaryAdvice } = req.body;

    if (!patientId || !medications || medications.length === 0) {
      return sendError(res, 'Patient and at least one medication are required.', 400);
    }

    const targetDoctorId = doctorId || req.user.doctorId;
    if (!targetDoctorId) {
      return sendError(res, 'Doctor identification is required.', 400);
    }

    const count = await Prescription.countDocuments();
    const prescriptionNumber = `RX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(count + 1).padStart(3, '0')}`;

    const prescription = await Prescription.create({
      prescriptionNumber,
      encounterId,
      patientId,
      doctorId: targetDoctorId,
      medications,
      generalInstructions,
      dietaryAdvice,
    });

    // Notify patient
    const patient = await Patient.findById(patientId);
    if (patient?.userId) {
      await createNotification({
        userId: patient.userId,
        title: 'New Prescription Issued',
        message: `Your prescription (${prescriptionNumber}) has been issued. You can view medications and instructions in your portal.`,
        type: 'clinical',
        link: '/patient/prescriptions',
      });
    }

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PRESCRIPTION_CREATE',
      resourceType: 'Prescription',
      resourceId: prescription._id,
      outcome: 'success',
      details: { prescriptionNumber, patientId },
      req,
    });

    return sendSuccess(res, prescription, 'Prescription created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const generateAIExplanation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return sendError(res, 'Prescription not found', 404);
    }

    const aiResult = await explainPrescriptionInstructions({
      medications: prescription.medications,
      generalInstructions: prescription.generalInstructions,
      dietaryAdvice: prescription.dietaryAdvice,
    });

    prescription.plainLanguageExplanation = {
      text: aiResult.explanation,
      generatedAt: new Date(),
    };

    await prescription.save();

    return sendSuccess(res, prescription.plainLanguageExplanation, 'Patient-friendly explanation generated');
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id)
      .populate('patientId')
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
        ],
      })
      .populate('encounterId');

    if (!prescription) {
      return sendError(res, 'Prescription not found', 404);
    }

    // Role check: patient can only view their own prescription
    if (req.user.role === 'patient') {
      if (!req.user.patientId || req.user.patientId.toString() !== prescription.patientId._id.toString()) {
        return sendError(res, 'Access denied', 403);
      }
    }

    return sendSuccess(res, prescription);
  } catch (error) {
    next(error);
  }
};
