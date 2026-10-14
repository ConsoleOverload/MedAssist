import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { validateSlotAvailability, getDayDateRange } from '../services/schedulingService.js';
import { createNotification } from '../services/notificationService.js';
import { recordAuditEvent } from '../services/auditService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listAppointments = async (req, res, next) => {
  try {
    const { doctorId, patientId, date, status, page = 1, limit = 50 } = req.query;
    const query = {};

    // Patient can only see their own appointments
    if (req.user.role === 'patient') {
      if (!req.user.patientId) {
        return sendSuccess(res, [], 'No appointments found', 200, { page: 1, limit: 50, total: 0 });
      }
      query.patientId = req.user.patientId;
    } else {
      if (patientId) query.patientId = patientId;
    }

    // Doctor can default to seeing their own appointments if specified
    if (req.user.role === 'doctor' && req.user.doctorId && !doctorId) {
      query.doctorId = req.user.doctorId;
    } else if (doctorId) {
      query.doctorId = doctorId;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const { startOfDay, endOfDay } = getDayDateRange(date);
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patientId', 'firstName lastName mrn phone email dateOfBirth gender')
        .populate({
          path: 'doctorId',
          populate: [
            { path: 'userId', select: 'name email phone avatar' },
            { path: 'departmentId', select: 'name code color' },
          ],
        })
        .populate('serviceId', 'name fee durationMinutes')
        .sort({ appointmentDate: -1, startTime: 1 })
        .skip(skip)
        .limit(limitNum),
      Appointment.countDocuments(query),
    ]);

    return sendSuccess(res, appointments, 'Appointments retrieved', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, patientId, appointmentDate, startTime, serviceId, departmentId, reason, notes } = req.body;

    // Determine target patient
    let targetPatientId = patientId;
    if (req.user.role === 'patient') {
      targetPatientId = req.user.patientId;
    }

    if (!doctorId || !targetPatientId || !appointmentDate || !startTime) {
      return sendError(res, 'Doctor, patient, appointment date, and start time are required.', 400);
    }

    // Server-side atomic slot conflict check
    const { endTime } = await validateSlotAvailability(doctorId, appointmentDate, startTime);

    const doctor = await Doctor.findById(doctorId).populate('userId', 'name');
    const patient = await Patient.findById(targetPatientId);

    if (!doctor || !patient) {
      return sendError(res, 'Doctor or Patient record not found.', 404);
    }

    // Generate appointment number
    const dateFormatted = new Date(appointmentDate).toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await Appointment.countDocuments({
      appointmentDate: {
        $gte: new Date(new Date(appointmentDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(appointmentDate).setHours(23, 59, 59, 999)),
      },
    });
    const appointmentNumber = `APT-${dateFormatted}-${String(countToday + 1).padStart(3, '0')}`;

    const appointment = await Appointment.create({
      appointmentNumber,
      patientId: targetPatientId,
      doctorId,
      departmentId: departmentId || doctor.departmentId,
      serviceId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      reason: reason || 'Consultation',
      notes: notes || '',
      status: 'booked',
      bookedBy: req.user.userId,
    });

    // Notify Doctor
    if (doctor.userId?._id) {
      await createNotification({
        userId: doctor.userId._id,
        title: 'New Appointment Booked',
        message: `Patient ${patient.fullName} booked an appointment for ${new Date(appointmentDate).toLocaleDateString()} at ${startTime}.`,
        type: 'appointment',
        link: '/doctor/dashboard',
      });
    }

    // Notify Patient if user account exists
    if (patient.userId) {
      await createNotification({
        userId: patient.userId,
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. ${doctor.userId?.name} is confirmed for ${new Date(appointmentDate).toLocaleDateString()} at ${startTime}.`,
        type: 'appointment',
        link: '/patient/appointments',
      });
    }

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'APPOINTMENT_BOOK',
      resourceType: 'Appointment',
      resourceId: appointment._id,
      outcome: 'success',
      details: { appointmentNumber, doctor: doctor.userId?.name, patient: patient.fullName },
      req,
    });

    return sendSuccess(res, appointment, 'Appointment booked successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const appointment = await Appointment.findById(id)
      .populate('patientId')
      .populate({ path: 'doctorId', populate: { path: 'userId' } });

    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    const previousStatus = appointment.status;

    // Transition Logic & Auditing
    if (status === 'arrived') {
      // Calculate today's queue number
      const { startOfDay, endOfDay } = getDayDateRange(appointment.appointmentDate);
      const queueCount = await Appointment.countDocuments({
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        doctorId: appointment.doctorId._id,
        queueNumber: { $ne: null },
      });
      appointment.queueNumber = queueCount + 1;
      appointment.checkInTime = new Date();
      appointment.status = 'arrived';
    } else if (status === 'in-consultation') {
      appointment.consultationStartTime = new Date();
      appointment.status = 'in-consultation';
    } else if (status === 'completed') {
      appointment.completedTime = new Date();
      appointment.status = 'completed';
    } else if (status === 'cancelled') {
      appointment.cancelledTime = new Date();
      appointment.cancellationReason = cancellationReason || 'Cancelled by clinic';
      appointment.status = 'cancelled';
    } else {
      appointment.status = status;
    }

    await appointment.save();

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'APPOINTMENT_STATUS_CHANGE',
      resourceType: 'Appointment',
      resourceId: appointment._id,
      outcome: 'success',
      details: { previousStatus, newStatus: appointment.status },
      req,
    });

    return sendSuccess(res, appointment, `Appointment status updated to ${appointment.status}`);
  } catch (error) {
    next(error);
  }
};

export const getWaitingQueue = async (req, res, next) => {
  try {
    const { doctorId } = req.query;
    const { startOfDay, endOfDay } = getDayDateRange(new Date());

    const query = {
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['arrived', 'in-consultation'] },
    };

    if (doctorId) {
      query.doctorId = doctorId;
    } else if (req.user.role === 'doctor' && req.user.doctorId) {
      query.doctorId = req.user.doctorId;
    }

    const queue = await Appointment.find(query)
      .populate('patientId', 'firstName lastName mrn phone bloodGroup dateOfBirth')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ queueNumber: 1, checkInTime: 1 });

    return sendSuccess(res, queue);
  } catch (error) {
    next(error);
  }
};
