import { Encounter } from '../models/Encounter.js';
import { Appointment } from '../models/Appointment.js';
import { generateEncounterSummary } from '../services/aiService.js';
import { recordAuditEvent } from '../services/auditService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getEncounterByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    let encounter = await Encounter.findOne({ appointmentId })
      .populate('patientId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('finalizedBy', 'name');

    if (!encounter) {
      // Find appointment to initialize draft encounter
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return sendError(res, 'Appointment not found', 404);
      }

      const count = await Encounter.countDocuments();
      const encounterNumber = `ENC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(count + 1).padStart(3, '0')}`;

      encounter = await Encounter.create({
        encounterNumber,
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        status: 'draft',
        chiefComplaint: appointment.reason || 'General Consultation',
      });

      encounter = await Encounter.findById(encounter._id)
        .populate('patientId')
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } });
    }

    return sendSuccess(res, encounter);
  } catch (error) {
    next(error);
  }
};

export const saveEncounterDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vitals, chiefComplaint, symptoms, soapNotes, diagnoses, followUpPlan } = req.body;

    const encounter = await Encounter.findById(id);
    if (!encounter) {
      return sendError(res, 'Encounter not found', 404);
    }

    // Protection: do not allow silent edits if already finalized
    if (encounter.status === 'finalized' && !req.body.amendmentReason) {
      return sendError(
        res,
        'This clinical encounter has already been finalized and signed. To amend, provide an amendmentReason.',
        403
      );
    }

    if (vitals) encounter.vitals = vitals;
    if (chiefComplaint) encounter.chiefComplaint = chiefComplaint;
    if (symptoms) encounter.symptoms = symptoms;
    if (soapNotes) encounter.soapNotes = soapNotes;
    if (diagnoses) encounter.diagnoses = diagnoses;
    if (followUpPlan) encounter.followUpPlan = followUpPlan;

    if (encounter.status === 'finalized' && req.body.amendmentReason) {
      encounter.status = 'amended';
      encounter.amendmentReason = req.body.amendmentReason;
    }

    await encounter.save();

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: encounter.status === 'amended' ? 'ENCOUNTER_AMENDED' : 'ENCOUNTER_DRAFT_SAVE',
      resourceType: 'Encounter',
      resourceId: encounter._id,
      outcome: 'success',
      req,
    });

    return sendSuccess(res, encounter, 'Encounter draft saved');
  } catch (error) {
    next(error);
  }
};

export const finalizeEncounter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const encounter = await Encounter.findById(id);
    if (!encounter) {
      return sendError(res, 'Encounter not found', 404);
    }

    encounter.status = 'finalized';
    encounter.finalizedAt = new Date();
    encounter.finalizedBy = req.user.userId;

    await encounter.save();

    // Also mark associated appointment as completed
    await Appointment.findByIdAndUpdate(encounter.appointmentId, {
      status: 'completed',
      completedTime: new Date(),
    });

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'ENCOUNTER_FINALIZED_AND_SIGNED',
      resourceType: 'Encounter',
      resourceId: encounter._id,
      outcome: 'success',
      req,
    });

    return sendSuccess(res, encounter, 'Encounter officially finalized and signed.');
  } catch (error) {
    next(error);
  }
};

export const requestAISummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const encounter = await Encounter.findById(id);
    if (!encounter) {
      return sendError(res, 'Encounter not found', 404);
    }

    const aiResult = await generateEncounterSummary({
      chiefComplaint: encounter.chiefComplaint,
      symptoms: encounter.symptoms,
      soapNotes: encounter.soapNotes,
      diagnoses: encounter.diagnoses,
      vitals: encounter.vitals,
      followUpPlan: encounter.followUpPlan,
    });

    encounter.aiSummary = {
      generatedText: aiResult.summary,
      status: 'unapproved_draft',
    };

    await encounter.save();

    return sendSuccess(res, encounter.aiSummary, 'AI clinical summary generated for review');
  } catch (error) {
    next(error);
  }
};

export const approveAISummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvedText } = req.body;

    const encounter = await Encounter.findById(id);
    if (!encounter) {
      return sendError(res, 'Encounter not found', 404);
    }

    encounter.aiSummary = {
      generatedText: approvedText || encounter.aiSummary.generatedText,
      status: 'approved_by_clinician',
      approvedAt: new Date(),
      approvedBy: req.user.userId,
    };

    await encounter.save();

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'AI_SUMMARY_APPROVED',
      resourceType: 'Encounter',
      resourceId: encounter._id,
      outcome: 'success',
      req,
    });

    return sendSuccess(res, encounter.aiSummary, 'AI summary approved by clinician');
  } catch (error) {
    next(error);
  }
};
