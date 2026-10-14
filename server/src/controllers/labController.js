import { LaboratoryOrder } from '../models/LaboratoryOrder.js';
import { Patient } from '../models/Patient.js';
import { recordAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listLabOrders = async (req, res, next) => {
  try {
    const { status, priority, patientId, testCode } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      if (!req.user.patientId) return sendSuccess(res, []);
      query.patientId = req.user.patientId;
      // Critical privacy rule: patients can ONLY see released lab orders!
      query.status = 'released';
    } else {
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (patientId) query.patientId = patientId;
      if (testCode) query.testCode = testCode;
    }

    const orders = await LaboratoryOrder.find(query)
      .populate('patientId', 'firstName lastName mrn dateOfBirth gender phone')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('sampleCollectedBy', 'name')
      .populate('verifiedBy', 'name')
      .populate('releasedBy', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
};

export const createLabOrder = async (req, res, next) => {
  try {
    const { encounterId, patientId, testName, testCode, category, priority, sampleType, clinicalNotes } = req.body;

    if (!patientId || !testName || !testCode) {
      return sendError(res, 'Patient ID, test name, and test code are required', 400);
    }

    const doctorId = req.body.doctorId || req.user.doctorId;
    if (!doctorId) {
      return sendError(res, 'Doctor identification is required', 400);
    }

    const count = await LaboratoryOrder.countDocuments();
    const orderNumber = `LAB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(count + 1).padStart(3, '0')}`;

    const order = await LaboratoryOrder.create({
      orderNumber,
      encounterId,
      patientId,
      doctorId,
      testName,
      testCode,
      category: category || 'Biochemistry',
      priority: priority || 'routine',
      sampleType: sampleType || 'Blood (Serum)',
      clinicalNotes: clinicalNotes || '',
      status: 'ordered',
    });

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'LAB_ORDER_CREATE',
      resourceType: 'LaboratoryOrder',
      resourceId: order._id,
      outcome: 'success',
      details: { orderNumber, testCode, testName },
      req,
    });

    return sendSuccess(res, order, 'Laboratory test ordered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const collectSample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accessionNumber } = req.body;

    const order = await LaboratoryOrder.findById(id);
    if (!order) return sendError(res, 'Lab order not found', 404);

    if (order.status !== 'ordered') {
      return sendError(res, `Cannot collect sample for order in status '${order.status}'`, 400);
    }

    const generatedAccession = accessionNumber || `ACC-${Date.now().toString().slice(-6)}`;

    order.accessionNumber = generatedAccession;
    order.sampleCollectedAt = new Date();
    order.sampleCollectedBy = req.user.userId;
    order.status = 'sample_collected';

    await order.save();

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'LAB_SAMPLE_COLLECTED',
      resourceType: 'LaboratoryOrder',
      resourceId: order._id,
      outcome: 'success',
      details: { accessionNumber: generatedAccession },
      req,
    });

    return sendSuccess(res, order, 'Sample collected and accessioned');
  } catch (error) {
    next(error);
  }
};

export const startProcessing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await LaboratoryOrder.findById(id);
    if (!order) return sendError(res, 'Lab order not found', 404);

    order.status = 'processing';
    order.processingStartedAt = new Date();
    await order.save();

    return sendSuccess(res, order, 'Sample is now in processing');
  } catch (error) {
    next(error);
  }
};

export const enterResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { results, technicianNotes } = req.body; // array of { parameter, value, unit, referenceRange, flag }

    if (!Array.isArray(results) || results.length === 0) {
      return sendError(res, 'At least one test result parameter is required', 400);
    }

    const order = await LaboratoryOrder.findById(id);
    if (!order) return sendError(res, 'Lab order not found', 404);

    order.results = results;
    order.technicianNotes = technicianNotes || order.technicianNotes;
    order.resultsEnteredAt = new Date();
    order.resultsEnteredBy = req.user.userId;
    order.status = 'completed_pending_verification';

    await order.save();

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'LAB_RESULTS_ENTERED',
      resourceType: 'LaboratoryOrder',
      resourceId: order._id,
      outcome: 'success',
      details: { parametersCount: results.length },
      req,
    });

    return sendSuccess(res, order, 'Test results entered and submitted for clinical verification');
  } catch (error) {
    next(error);
  }
};

export const verifyResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await LaboratoryOrder.findById(id);
    if (!order) return sendError(res, 'Lab order not found', 404);

    if (order.status !== 'completed_pending_verification') {
      return sendError(res, 'Only results in status "completed_pending_verification" can be verified', 400);
    }

    order.status = 'verified';
    order.verifiedAt = new Date();
    order.verifiedBy = req.user.userId;

    await order.save();

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'LAB_RESULTS_VERIFIED',
      resourceType: 'LaboratoryOrder',
      resourceId: order._id,
      outcome: 'success',
      req,
    });

    return sendSuccess(res, order, 'Lab results verified successfully');
  } catch (error) {
    next(error);
  }
};

export const releaseResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await LaboratoryOrder.findById(id).populate('patientId');
    if (!order) return sendError(res, 'Lab order not found', 404);

    if (order.status !== 'verified') {
      return sendError(res, 'Results must be clinically verified before releasing to patient portal', 400);
    }

    order.status = 'released';
    order.releasedAt = new Date();
    order.releasedBy = req.user.userId;

    await order.save();

    // Send notification to patient
    if (order.patientId?.userId) {
      await createNotification({
        userId: order.patientId.userId,
        title: 'Laboratory Report Available',
        message: `Your test report for ${order.testName} has been verified and released. You can now view and download it in your portal.`,
        type: 'lab',
        link: '/patient/lab-reports',
      });
    }

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'LAB_RESULTS_RELEASED_TO_PATIENT',
      resourceType: 'LaboratoryOrder',
      resourceId: order._id,
      outcome: 'success',
      req,
    });

    return sendSuccess(res, order, 'Results released to patient portal');
  } catch (error) {
    next(error);
  }
};

export const getLabOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await LaboratoryOrder.findById(id)
      .populate('patientId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('sampleCollectedBy', 'name')
      .populate('verifiedBy', 'name')
      .populate('releasedBy', 'name');

    if (!order) return sendError(res, 'Lab order not found', 404);

    if (req.user.role === 'patient') {
      if (order.status !== 'released') {
        return sendError(res, 'This laboratory report has not yet been released by the clinical team.', 403);
      }
      if (req.user.patientId && req.user.patientId.toString() !== order.patientId._id.toString()) {
        return sendError(res, 'Access denied', 403);
      }
    }

    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};
