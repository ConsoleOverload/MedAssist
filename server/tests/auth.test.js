import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { ENV } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { generateAccessToken, verifyAccessToken } from '../src/utils/token.js';

describe('Security & Authentication Tests', () => {
  let adminUser;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGO_URI);
    }
    adminUser = await User.findOne({ email: 'admin@medassist.local' }).select('+password');
  });

  after(async () => {
    await mongoose.connection.close();
  });

  test('Validates seeded administrator exists with hashed password', async () => {
    assert.ok(adminUser, 'Admin exists');
    assert.notEqual(adminUser.password, 'AdminPass123!', 'Password is cryptographically hashed');

    const isValid = await adminUser.comparePassword('AdminPass123!');
    assert.equal(isValid, true, 'Matches correct password');

    const isInvalid = await adminUser.comparePassword('WrongPassword');
    assert.equal(isInvalid, false, 'Rejects incorrect password');
  });

  test('Generates and verifies JWT tokens with role claims', async () => {
    const payload = {
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
      name: adminUser.name,
    };

    const token = generateAccessToken(payload);
    assert.ok(token);

    const decoded = verifyAccessToken(token);
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.role, 'admin');
    assert.equal(decoded.email, adminUser.email);
  });
});
