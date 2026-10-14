import express from 'express';
import {
  listLabOrders,
  createLabOrder,
  collectSample,
  startProcessing,
  enterResults,
  verifyResults,
  releaseResults,
  getLabOrderById,
} from '../controllers/labController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listLabOrders);
router.get('/:id', getLabOrderById);
router.post('/', authorize('admin', 'doctor'), createLabOrder);

// Lab tech lifecycle actions
router.patch('/:id/collect-sample', authorize('admin', 'lab_technician'), collectSample);
router.patch('/:id/start-processing', authorize('admin', 'lab_technician'), startProcessing);
router.post('/:id/enter-results', authorize('admin', 'lab_technician'), enterResults);

// Verification and release
router.patch('/:id/verify', authorize('admin', 'doctor', 'lab_technician'), verifyResults);
router.patch('/:id/release', authorize('admin', 'doctor', 'lab_technician'), releaseResults);

export default router;
