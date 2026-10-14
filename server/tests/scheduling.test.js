import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { ENV } from '../src/config/env.js';
import { Doctor } from '../src/models/Doctor.js';
import { DoctorAvailability } from '../src/models/DoctorAvailability.js';
import { Appointment } from '../src/models/Appointment.js';
import { Patient } from '../src/models/Patient.js';
import { getAvailableSlots, validateSlotAvailability } from '../src/services/schedulingService.js';

describe('Clinical Scheduling & Conflict Engine Tests', () => {
  let testDoctor;
  let testPatient;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGO_URI);
    }

    testDoctor = await Doctor.findOne();
    testPatient = await Patient.findOne();
  });

  after(async () => {
    // Clean up any test appointments created
    await Appointment.deleteMany({ reason: 'TEST_CONFLICT_SLOT' });
    await mongoose.connection.close();
  });

  test('Computes slot availability for a scheduled working day', async () => {
    assert.ok(testDoctor, 'Doctor exists in seed');

    // Monday (date: 2026-10-19 is a Monday)
    const testDate = '2026-10-19';
    const result = await getAvailableSlots(testDoctor._id, testDate);

    assert.equal(result.isAvailable, true);
    assert.ok(result.slots.length > 0, 'Generates slots');

    // Morning slot should be available
    const morningSlot = result.slots.find((s) => s.startTime === '09:00');
    assert.ok(morningSlot, '09:00 slot exists');
    assert.equal(morningSlot.isAvailable, true);

    // Lunch break slot (13:00) should NOT be available
    const lunchSlot = result.slots.find((s) => s.startTime === '13:00');
    assert.ok(lunchSlot, '13:00 break slot exists');
    assert.equal(lunchSlot.isAvailable, false);
    assert.equal(lunchSlot.reason, 'Scheduled Break');
  });

  test('Prevents booking outside working hours', async () => {
    const testDate = '2026-10-19';

    await assert.rejects(
      async () => {
        await validateSlotAvailability(testDoctor._id, testDate, '07:00');
      },
      /outside the doctor's working hours/
    );
  });

  test('Detects conflict when slot is already booked', async () => {
    const testDate = '2026-10-19';
    const slotTime = '10:30';

    // Book an appointment at 10:30
    const booked = await Appointment.create({
      appointmentNumber: `TEST-APT-${Date.now()}`,
      patientId: testPatient._id,
      doctorId: testDoctor._id,
      appointmentDate: new Date(testDate),
      startTime: slotTime,
      endTime: '11:00',
      status: 'booked',
      reason: 'TEST_CONFLICT_SLOT',
    });

    assert.ok(booked._id);

    // Attempting to validate the same slot should throw conflict error
    await assert.rejects(
      async () => {
        await validateSlotAvailability(testDoctor._id, testDate, slotTime);
      },
      /Conflict detected: Doctor already has an active appointment/
    );
  });
});
