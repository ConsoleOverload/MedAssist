import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Department } from '../models/Department.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { recordAuditEvent } from '../services/auditService.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('patientProfile')
      .populate('doctorProfile');

    if (!user) {
      await recordAuditEvent({
        action: 'AUTH_LOGIN_FAILED',
        resourceType: 'User',
        outcome: 'failure',
        details: { email },
        req,
      });
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated. Please contact the clinic administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await recordAuditEvent({
        actorId: user._id,
        actorName: user.name,
        actorRole: user.role,
        action: 'AUTH_LOGIN_FAILED',
        resourceType: 'User',
        resourceId: user._id,
        outcome: 'failure',
        details: { reason: 'Incorrect password' },
        req,
      });
      return sendError(res, 'Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    await user.save();

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      patientId: user.patientProfile?._id?.toString(),
      doctorId: user.doctorProfile?._id?.toString(),
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await recordAuditEvent({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'AUTH_LOGIN_SUCCESS',
      resourceType: 'User',
      resourceId: user._id,
      outcome: 'success',
      req,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return sendSuccess(res, {
      user: userObj,
      accessToken,
    }, 'Signed in successfully');
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'patient', phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    const allowedRoles = ['patient', 'receptionist', 'doctor', 'lab_technician', 'admin'];
    const chosenRole = allowedRoles.includes(role) ? role : 'patient';

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, 'A user with this email address already exists', 409);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: chosenRole,
      phone,
    });

    // If registered as patient, automatically create Patient demographic profile
    if (chosenRole === 'patient') {
      const patientCount = await Patient.countDocuments();
      const mrn = `MRN-${String(patientCount + 1001).padStart(5, '0')}`;

      const patient = await Patient.create({
        userId: user._id,
        mrn,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || 'Patient',
        dateOfBirth: req.body.dateOfBirth || new Date(1990, 0, 1),
        gender: req.body.gender || 'other',
        phone: phone || '000-000-0000',
        email: user.email,
      });

      user.patientProfile = patient._id;
      await user.save();
    }

    // If registered as doctor, automatically link/create Doctor profile
    if (chosenRole === 'doctor') {
      let dept = await Department.findOne({ isActive: true });
      if (!dept) {
        dept = await Department.create({
          name: 'General Medicine',
          code: 'GEN',
          description: 'Outpatient primary care & general practice',
        });
      }

      const doc = await Doctor.create({
        userId: user._id,
        licenseNumber: req.body.licenseNumber || `MED-${Date.now().toString().slice(-6)}`,
        departmentId: req.body.departmentId || dept._id,
        specialties: req.body.specialties || ['General Practice'],
        consultationFee: req.body.consultationFee || 100,
        roomNumber: req.body.roomNumber || '101',
      });

      user.doctorProfile = doc._id;
      await user.save();
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      patientId: user.patientProfile?.toString(),
      doctorId: user.doctorProfile?.toString(),
    };

    const accessToken = generateAccessToken(payload);

    await recordAuditEvent({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'AUTH_REGISTER',
      resourceType: 'User',
      resourceId: user._id,
      outcome: 'success',
      req,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return sendSuccess(res, { user: userObj, accessToken }, 'Registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('patientProfile')
      .populate({
        path: 'doctorProfile',
        populate: { path: 'departmentId', select: 'name code' },
      });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return sendError(res, 'Refresh token not found', 401);
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId)
      .populate('patientProfile')
      .populate('doctorProfile');

    if (!user || !user.isActive) {
      return sendError(res, 'User no longer active', 403);
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      patientId: user.patientProfile?._id?.toString(),
      doctorId: user.doctorProfile?._id?.toString(),
    };

    const newAccessToken = generateAccessToken(payload);
    return sendSuccess(res, { accessToken: newAccessToken });
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.clearCookie('token');
  return sendSuccess(res, null, 'Logged out successfully');
};
