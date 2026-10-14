import { Appointment } from '../models/Appointment.js';
import { DoctorAvailability } from '../models/DoctorAvailability.js';

// Helper to convert "HH:mm" to minutes from midnight
export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to convert minutes from midnight to "HH:mm"
export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Calculates start/end dates for a local day to prevent timezone shift issues
 */
export const getDayDateRange = (dateInput) => {
  const d = new Date(dateInput);
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { startOfDay, endOfDay, dayOfWeek: d.getDay() };
};

/**
 * Generates available appointment slots for a doctor on a specific date
 */
export const getAvailableSlots = async (doctorId, dateStr) => {
  const { startOfDay, endOfDay, dayOfWeek } = getDayDateRange(dateStr);

  // 1. Fetch Doctor's availability configuration for this day of week
  const availability = await DoctorAvailability.findOne({
    doctorId,
    dayOfWeek,
    isAvailable: true,
  });

  if (!availability) {
    return {
      isAvailable: false,
      message: 'Doctor is not scheduled to work on this day',
      slots: [],
    };
  }

  // 2. Fetch all existing active bookings for this doctor on this day
  const existingAppointments = await Appointment.find({
    doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['booked', 'arrived', 'in-consultation'] },
  }).select('startTime endTime status');

  const bookedStartTimes = new Set(existingAppointments.map((a) => a.startTime));

  // 3. Generate candidate slots
  const startMins = timeToMinutes(availability.startTime);
  const endMins = timeToMinutes(availability.endTime);
  const slotDuration = availability.slotDurationMinutes || 30;

  const breakStartMins = availability.breakStartTime ? timeToMinutes(availability.breakStartTime) : -1;
  const breakEndMins = availability.breakEndTime ? timeToMinutes(availability.breakEndTime) : -1;

  const slots = [];
  let currentMins = startMins;

  while (currentMins + slotDuration <= endMins) {
    const slotStartTime = minutesToTime(currentMins);
    const slotEndTime = minutesToTime(currentMins + slotDuration);

    // Check if slot falls in lunch / break
    const isInBreak =
      breakStartMins !== -1 &&
      breakEndMins !== -1 &&
      currentMins >= breakStartMins &&
      currentMins < breakEndMins;

    const isBooked = bookedStartTimes.has(slotStartTime);

    slots.push({
      startTime: slotStartTime,
      endTime: slotEndTime,
      isAvailable: !isInBreak && !isBooked,
      reason: isInBreak ? 'Scheduled Break' : isBooked ? 'Already Booked' : 'Available',
    });

    currentMins += slotDuration;
  }

  return {
    isAvailable: true,
    dayOfWeek,
    workingHours: `${availability.startTime} - ${availability.endTime}`,
    slots,
  };
};

/**
 * Atomically validates that a slot is free before booking
 */
export const validateSlotAvailability = async (doctorId, dateStr, startTime, excludeAppointmentId = null) => {
  const { startOfDay, endOfDay, dayOfWeek } = getDayDateRange(dateStr);

  // Check working schedule
  const availability = await DoctorAvailability.findOne({
    doctorId,
    dayOfWeek,
    isAvailable: true,
  });

  if (!availability) {
    throw new Error('Doctor has no active schedule on this day of the week');
  }

  const slotMins = timeToMinutes(startTime);
  const startMins = timeToMinutes(availability.startTime);
  const endMins = timeToMinutes(availability.endTime);

  if (slotMins < startMins || slotMins >= endMins) {
    throw new Error(`Requested time ${startTime} is outside the doctor's working hours (${availability.startTime}-${availability.endTime})`);
  }

  if (availability.breakStartTime && availability.breakEndTime) {
    const breakStart = timeToMinutes(availability.breakStartTime);
    const breakEnd = timeToMinutes(availability.breakEndTime);
    if (slotMins >= breakStart && slotMins < breakEnd) {
      throw new Error(`Requested time ${startTime} falls during the doctor's scheduled break`);
    }
  }

  // Conflict query
  const query = {
    doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    startTime,
    status: { $in: ['booked', 'arrived', 'in-consultation'] },
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const conflict = await Appointment.findOne(query);
  if (conflict) {
    throw new Error(`Conflict detected: Doctor already has an active appointment at ${startTime} on this date.`);
  }

  // Slot duration
  const slotDuration = availability.slotDurationMinutes || 30;
  const endTime = minutesToTime(slotMins + slotDuration);

  return { isValid: true, endTime };
};
