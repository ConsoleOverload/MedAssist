import express from 'express';
import {
  listDoctors,
  getDoctorById,
  updateAvailability,
  getDoctorSlots,
} from '../controllers/doctorController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);
router.put('/:id/availability', authorize('admin', 'doctor'), updateAvailability);

export default router;
