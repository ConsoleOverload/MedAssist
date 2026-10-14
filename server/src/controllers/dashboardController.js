import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { LaboratoryOrder } from '../models/LaboratoryOrder.js';
import { Invoice } from '../models/Invoice.js';
import { Prescription } from '../models/Prescription.js';
import { Department } from '../models/Department.js';
import { getDayDateRange } from '../services/schedulingService.js';
import { sendSuccess } from '../utils/response.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { startOfDay, endOfDay } = getDayDateRange(new Date());

    if (role === 'admin') {
      const [
        totalPatients,
        appointmentsToday,
        activeDoctors,
        departments,
        invoices,
        recentAppointments,
      ] = await Promise.all([
        Patient.countDocuments({ isActive: true }),
        Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lte: endOfDay } }),
        Doctor.countDocuments({ isActive: true }),
        Department.countDocuments({ isActive: true }),
        Invoice.find({ status: { $in: ['paid', 'partially_paid'] } }).select('paidAmount totalAmount'),
        Appointment.find()
          .populate('patientId', 'firstName lastName mrn')
          .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
          .sort({ createdAt: -1 })
          .limit(6),
      ]);

      const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);

      return sendSuccess(res, {
        kpis: {
          totalPatients,
          appointmentsToday,
          activeDoctors,
          departments,
          totalRevenue,
        },
        recentAppointments,
      });
    }

    if (role === 'doctor') {
      const doctorId = req.user.doctorId;
      const [
        todayAppointments,
        arrivedQueue,
        inConsultation,
        completedToday,
        pendingLabVerifications,
      ] = await Promise.all([
        Appointment.find({
          doctorId,
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        })
          .populate('patientId', 'firstName lastName mrn phone bloodGroup dateOfBirth gender')
          .sort({ startTime: 1 }),
        Appointment.countDocuments({
          doctorId,
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          status: 'arrived',
        }),
        Appointment.countDocuments({
          doctorId,
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          status: 'in-consultation',
        }),
        Appointment.countDocuments({
          doctorId,
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          status: 'completed',
        }),
        LaboratoryOrder.countDocuments({
          doctorId,
          status: 'completed_pending_verification',
        }),
      ]);

      return sendSuccess(res, {
        kpis: {
          totalToday: todayAppointments.length,
          arrivedQueue,
          inConsultation,
          completedToday,
          pendingLabVerifications,
        },
        todayAppointments,
      });
    }

    if (role === 'receptionist') {
      const [
        appointmentsToday,
        waitingQueue,
        pendingInvoices,
        totalRegisteredPatients,
      ] = await Promise.all([
        Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lte: endOfDay } }),
        Appointment.find({
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ['arrived', 'in-consultation'] },
        })
          .populate('patientId', 'firstName lastName mrn phone bloodGroup')
          .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
          .sort({ queueNumber: 1 }),
        Invoice.countDocuments({ status: 'pending' }),
        Patient.countDocuments({ isActive: true }),
      ]);

      return sendSuccess(res, {
        kpis: {
          appointmentsToday,
          inWaitingRoom: waitingQueue.length,
          pendingInvoices,
          totalRegisteredPatients,
        },
        waitingQueue,
      });
    }

    if (role === 'lab_technician') {
      const [
        ordered,
        sampleCollected,
        processing,
        pendingVerification,
        verified,
        releasedToday,
      ] = await Promise.all([
        LaboratoryOrder.countDocuments({ status: 'ordered' }),
        LaboratoryOrder.countDocuments({ status: 'sample_collected' }),
        LaboratoryOrder.countDocuments({ status: 'processing' }),
        LaboratoryOrder.countDocuments({ status: 'completed_pending_verification' }),
        LaboratoryOrder.countDocuments({ status: 'verified' }),
        LaboratoryOrder.countDocuments({
          status: 'released',
          releasedAt: { $gte: startOfDay, $lte: endOfDay },
        }),
      ]);

      return sendSuccess(res, {
        kpis: {
          ordered,
          sampleCollected,
          processing,
          pendingVerification,
          verified,
          releasedToday,
        },
      });
    }

    if (role === 'patient') {
      const patientId = req.user.patientId;
      if (!patientId) {
        return sendSuccess(res, {
          kpis: { upcomingCount: 0, activePrescriptions: 0, releasedLabReports: 0, unpaidInvoices: 0 },
          upcomingAppointments: [],
        });
      }

      const [
        upcomingAppointments,
        activePrescriptions,
        releasedLabReports,
        unpaidInvoices,
      ] = await Promise.all([
        Appointment.find({
          patientId,
          appointmentDate: { $gte: startOfDay },
          status: { $in: ['booked', 'arrived'] },
        })
          .populate({
            path: 'doctorId',
            populate: [
              { path: 'userId', select: 'name' },
              { path: 'departmentId', select: 'name' },
            ],
          })
          .sort({ appointmentDate: 1, startTime: 1 })
          .limit(3),
        Prescription.countDocuments({ patientId, status: 'active' }),
        LaboratoryOrder.countDocuments({ patientId, status: 'released' }),
        Invoice.countDocuments({ patientId, status: { $in: ['pending', 'partially_paid'] } }),
      ]);

      return sendSuccess(res, {
        kpis: {
          upcomingCount: upcomingAppointments.length,
          activePrescriptions,
          releasedLabReports,
          unpaidInvoices,
        },
        upcomingAppointments,
      });
    }

    return sendSuccess(res, {});
  } catch (error) {
    next(error);
  }
};
