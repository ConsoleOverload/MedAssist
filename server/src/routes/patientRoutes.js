import express from 'express';
import {
  listPatients,
  getPatientById,
  createPatient,
  updatePatient,
  getPatientTimeline,
} from '../controllers/patientController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, requirePatientSelfOrStaff } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

// List and create patients (Staff only)
router.get('/', authorize('admin', 'doctor', 'receptionist'), listPatients);
router.post('/', authorize('admin', 'doctor', 'receptionist'), createPatient);

// View and update patient profile
router.get('/:id', requirePatientSelfOrStaff, getPatientById);
router.put('/:id', authorize('admin', 'doctor', 'receptionist'), updatePatient);

// Chronological Medical Timeline
router.get('/:id/timeline', requirePatientSelfOrStaff, getPatientTimeline);

export default router;
