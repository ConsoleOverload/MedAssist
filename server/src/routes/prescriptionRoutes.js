import express from 'express';
import {
  listPrescriptions,
  createPrescription,
  generateAIExplanation,
  getPrescriptionById,
} from '../controllers/prescriptionController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listPrescriptions);
router.get('/:id', getPrescriptionById);
router.post('/', authorize('admin', 'doctor'), createPrescription);
router.post('/:id/explain-ai', generateAIExplanation); // Can be requested by doctor or patient

export default router;
