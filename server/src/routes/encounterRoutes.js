import express from 'express';
import {
  getEncounterByAppointment,
  saveEncounterDraft,
  finalizeEncounter,
  requestAISummary,
  approveAISummary,
} from '../controllers/encounterController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

// Restricted to Doctors and Admins
router.get('/appointment/:appointmentId', authorize('admin', 'doctor'), getEncounterByAppointment);
router.put('/:id/draft', authorize('admin', 'doctor'), saveEncounterDraft);
router.post('/:id/finalize', authorize('admin', 'doctor'), finalizeEncounter);
router.post('/:id/ai-summary', authorize('admin', 'doctor'), requestAISummary);
router.post('/:id/ai-summary/approve', authorize('admin', 'doctor'), approveAISummary);

export default router;
