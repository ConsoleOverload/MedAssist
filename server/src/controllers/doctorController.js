import { Doctor } from '../models/Doctor.js';
import { DoctorAvailability } from '../models/DoctorAvailability.js';
import { getAvailableSlots } from '../services/schedulingService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listDoctors = async (req, res, next) => {
  try {
    const { departmentId, search } = req.query;
    const query = { isActive: true };

    if (departmentId) {
      query.departmentId = departmentId;
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone avatar')
      .populate('departmentId', 'name code color')
      .sort({ createdAt: -1 });

    let filtered = doctors;
    if (search) {
      const s = search.toLowerCase();
      filtered = doctors.filter(
        (doc) =>
          doc.userId?.name?.toLowerCase().includes(s) ||
          doc.specialties?.some((spec) => spec.toLowerCase().includes(s)) ||
          doc.departmentId?.name?.toLowerCase().includes(s)
      );
    }

    return sendSuccess(res, filtered);
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id)
      .populate('userId', 'name email phone avatar')
      .populate('departmentId', 'name code color description');

    if (!doctor) {
      return sendError(res, 'Doctor not found', 404);
    }

    const schedules = await DoctorAvailability.find({ doctorId: doctor._id }).sort({ dayOfWeek: 1 });

    return sendSuccess(res, {
      ...doctor.toObject(),
      schedules,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { schedules } = req.body; // array of { dayOfWeek, startTime, endTime, breakStartTime, breakEndTime, slotDurationMinutes, isAvailable }

    if (!Array.isArray(schedules)) {
      return sendError(res, 'Schedules must be an array', 400);
    }

    // Upsert each day schedule
    const operations = schedules.map((item) => ({
      updateOne: {
        filter: { doctorId: id, dayOfWeek: item.dayOfWeek },
        update: { $set: { ...item, doctorId: id } },
        upsert: true,
      },
    }));

    await DoctorAvailability.bulkWrite(operations);

    const updatedSchedules = await DoctorAvailability.find({ doctorId: id }).sort({ dayOfWeek: 1 });
    return sendSuccess(res, updatedSchedules, 'Doctor schedules updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getDoctorSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return sendError(res, 'Query parameter "date" (YYYY-MM-DD) is required', 400);
    }

    const slotsData = await getAvailableSlots(id, date);
    return sendSuccess(res, slotsData);
  } catch (error) {
    next(error);
  }
};
