import express from 'express';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { recordAuditEvent } from '../services/auditService.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

// List all users
router.get('/', async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('patientProfile', 'mrn')
      .populate('doctorProfile', 'licenseNumber specialties departmentId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
});

// Create staff user
router.post('/staff', async (req, res, next) => {
  try {
    const { name, email, password, role, phone, licenseNumber, departmentId, specialties, consultationFee, roomNumber } = req.body;

    if (!['admin', 'doctor', 'receptionist', 'lab_technician'].includes(role)) {
      return sendError(res, 'Invalid staff role', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 'User with this email already exists', 409);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role,
      phone,
    });

    if (role === 'doctor') {
      const doc = await Doctor.create({
        userId: user._id,
        licenseNumber: licenseNumber || `MED-${Date.now().toString().slice(-5)}`,
        departmentId,
        specialties: specialties || ['General Medicine'],
        consultationFee: consultationFee || 100,
        roomNumber: roomNumber || '101',
      });
      user.doctorProfile = doc._id;
      await user.save();
    }

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'STAFF_USER_CREATE',
      resourceType: 'User',
      resourceId: user._id,
      outcome: 'success',
      details: { role, email: user.email },
      req,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return sendSuccess(res, userObj, 'Staff member registered successfully', 201);
  } catch (error) {
    next(error);
  }
});

// Toggle activate / deactivate with safety check for last admin
router.patch('/:id/toggle-status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return sendError(res, 'User not found', 404);

    if (user.role === 'admin' && user.isActive) {
      const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdminCount <= 1) {
        return sendError(res, 'Security rule: Cannot deactivate the last remaining active Administrator.', 400);
      }
    }

    user.isActive = !user.isActive;
    await user.save();

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      resourceType: 'User',
      resourceId: user._id,
      outcome: 'success',
      req,
    });

    return sendSuccess(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    next(error);
  }
});

export default router;
