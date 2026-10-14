import { sendError } from '../utils/response.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this action.`,
        403
      );
    }

    next();
  };
};

export const requirePatientSelfOrStaff = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  // Clinic staff roles have broad authorization for patient care
  if (['admin', 'doctor', 'receptionist', 'lab_technician'].includes(req.user.role)) {
    return next();
  }

  // If patient, ensure they only access their own patientId
  const requestedPatientId = req.params.patientId || req.query.patientId || req.body.patientId;
  if (req.user.role === 'patient') {
    if (req.user.patientId && requestedPatientId && req.user.patientId.toString() !== requestedPatientId.toString()) {
      return sendError(res, 'Access denied. You may only access your own patient records.', 403);
    }
    return next();
  }

  return sendError(res, 'Access denied', 403);
};
