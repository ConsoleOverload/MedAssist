import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { Encounter } from '../models/Encounter.js';
import { Prescription } from '../models/Prescription.js';
import { LaboratoryOrder } from '../models/LaboratoryOrder.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { recordAuditEvent } from '../services/auditService.js';

export const listPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { mrn: regex },
        { phone: regex },
        { email: regex },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [patients, total] = await Promise.all([
      Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Patient.countDocuments(query),
    ]);

    return sendSuccess(res, patients, 'Patients retrieved successfully', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id).populate('userId', 'email name role avatar');

    if (!patient) {
      return sendError(res, 'Patient record not found', 404);
    }

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PATIENT_RECORD_VIEW',
      resourceType: 'Patient',
      resourceId: patient._id,
      outcome: 'success',
      req,
    });

    return sendSuccess(res, patient);
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      bloodGroup,
      allergies,
      emergencyContact,
      medicalHistory,
      insuranceProvider,
      insurancePolicyNumber,
    } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !phone || !gender) {
      return sendError(res, 'First name, last name, date of birth, gender, and phone are required.', 400);
    }

    // Duplicate check warning/prevention
    const existingPatient = await Patient.findOne({
      phone: phone.trim(),
      isActive: true,
    });

    if (existingPatient) {
      return sendError(
        res,
        `Duplicate warning: A patient with phone number ${phone} is already registered under MRN: ${existingPatient.mrn} (${existingPatient.fullName}).`,
        409
      );
    }

    // Auto-generate MRN
    const count = await Patient.countDocuments();
    const mrn = `MRN-${String(count + 1001).padStart(5, '0')}`;

    const newPatient = await Patient.create({
      mrn,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      bloodGroup,
      allergies,
      emergencyContact,
      medicalHistory,
      insuranceProvider,
      insurancePolicyNumber,
    });

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PATIENT_CREATE',
      resourceType: 'Patient',
      resourceId: newPatient._id,
      outcome: 'success',
      details: { mrn: newPatient.mrn, name: newPatient.fullName },
      req,
    });

    return sendSuccess(res, newPatient, 'Patient registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Patient.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updated) {
      return sendError(res, 'Patient not found', 404);
    }

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PATIENT_UPDATE',
      resourceType: 'Patient',
      resourceId: updated._id,
      outcome: 'success',
      req,
    });

    return sendSuccess(res, updated, 'Patient details updated');
  } catch (error) {
    next(error);
  }
};

export const getPatientTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [appointments, encounters, prescriptions, labOrders] = await Promise.all([
      Appointment.find({ patientId: id })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
        .populate('departmentId', 'name')
        .sort({ appointmentDate: -1 }),
      Encounter.find({ patientId: id })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
        .sort({ encounterDate: -1 }),
      Prescription.find({ patientId: id })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
        .sort({ issuedDate: -1 }),
      LaboratoryOrder.find({
        patientId: id,
        // If logged in as patient, only show released lab results!
        ...(req.user.role === 'patient' ? { status: 'released' } : {}),
      })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
        .sort({ createdAt: -1 }),
    ]);

    // Aggregate into a unified chronological stream
    const timelineEvents = [];

    appointments.forEach((apt) => {
      timelineEvents.push({
        id: apt._id,
        eventType: 'appointment',
        date: apt.appointmentDate,
        title: `Appointment: ${apt.reason}`,
        doctor: apt.doctorId?.userId?.name || 'Doctor',
        department: apt.departmentId?.name || 'General',
        status: apt.status,
        time: `${apt.startTime} - ${apt.endTime}`,
        data: apt,
      });
    });

    encounters.forEach((enc) => {
      timelineEvents.push({
        id: enc._id,
        eventType: 'encounter',
        date: enc.encounterDate,
        title: `Clinical Encounter: ${enc.chiefComplaint || 'Consultation'}`,
        doctor: enc.doctorId?.userId?.name || 'Doctor',
        status: enc.status,
        diagnoses: enc.diagnoses,
        soapNotes: enc.soapNotes,
        aiSummary: enc.aiSummary,
        data: enc,
      });
    });

    prescriptions.forEach((rx) => {
      timelineEvents.push({
        id: rx._id,
        eventType: 'prescription',
        date: rx.issuedDate,
        title: `Prescription: ${rx.medications?.length || 0} medications`,
        doctor: rx.doctorId?.userId?.name || 'Doctor',
        status: rx.status,
        medications: rx.medications,
        plainLanguageExplanation: rx.plainLanguageExplanation?.text,
        data: rx,
      });
    });

    labOrders.forEach((lab) => {
      timelineEvents.push({
        id: lab._id,
        eventType: 'laboratory',
        date: lab.createdAt,
        title: `Lab Test: ${lab.testName} (${lab.testCode})`,
        doctor: lab.doctorId?.userId?.name || 'Doctor',
        status: lab.status,
        results: lab.results,
        data: lab,
      });
    });

    // Sort descending by date
    timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sendSuccess(res, timelineEvents, 'Patient chronological timeline retrieved');
  } catch (error) {
    next(error);
  }
};
