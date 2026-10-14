import express from 'express';
import {
  listServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/clinicServiceController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listServices);
router.post('/', authorize('admin'), createService);
router.put('/:id', authorize('admin'), updateService);
router.delete('/:id', authorize('admin'), deleteService);

export default router;
