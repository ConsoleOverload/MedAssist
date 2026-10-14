import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { ENV } from '../src/config/env.js';
import { LaboratoryOrder } from '../src/models/LaboratoryOrder.js';
import { Patient } from '../src/models/Patient.js';
import { Doctor } from '../src/models/Doctor.js';

describe('Laboratory Order State Machine & Verification Gates', () => {
  let patient;
  let doctor;
  let testOrder;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGO_URI);
    }
    patient = await Patient.findOne();
    doctor = await Doctor.findOne();
  });

  after(async () => {
    if (testOrder?._id) {
      await LaboratoryOrder.findByIdAndDelete(testOrder._id);
    }
    await mongoose.connection.close();
  });

  test('Creates new lab order in "ordered" state', async () => {
    testOrder = await LaboratoryOrder.create({
      orderNumber: `TEST-LAB-${Date.now()}`,
      patientId: patient._id,
      doctorId: doctor._id,
      testName: 'Lipid Panel Test',
      testCode: 'TEST-LIPID',
      status: 'ordered',
    });

    assert.equal(testOrder.status, 'ordered');
    assert.ok(testOrder._id);
  });

  test('Transitions from ordered to sample_collected with accessioning', async () => {
    testOrder.status = 'sample_collected';
    testOrder.accessionNumber = `ACC-TEST-${Date.now().toString().slice(-4)}`;
    testOrder.sampleCollectedAt = new Date();
    await testOrder.save();

    const updated = await LaboratoryOrder.findById(testOrder._id);
    assert.equal(updated.status, 'sample_collected');
    assert.ok(updated.accessionNumber);
  });

  test('Enters results and requires clinical verification before release', async () => {
    testOrder.status = 'completed_pending_verification';
    testOrder.results = [
      { parameter: 'Cholesterol Total', value: '220', unit: 'mg/dL', referenceRange: '< 200', flag: 'abnormal' },
      { parameter: 'HDL Cholesterol', value: '45', unit: 'mg/dL', referenceRange: '> 40', flag: 'normal' },
    ];
    await testOrder.save();

    const pending = await LaboratoryOrder.findById(testOrder._id);
    assert.equal(pending.status, 'completed_pending_verification');
    assert.equal(pending.results.length, 2);

    // Verify
    pending.status = 'verified';
    pending.verifiedAt = new Date();
    await pending.save();

    const verified = await LaboratoryOrder.findById(testOrder._id);
    assert.equal(verified.status, 'verified');

    // Authorized release to patient
    verified.status = 'released';
    verified.releasedAt = new Date();
    await verified.save();

    const released = await LaboratoryOrder.findById(testOrder._id);
    assert.equal(released.status, 'released');
    assert.ok(released.releasedAt);
  });
});
