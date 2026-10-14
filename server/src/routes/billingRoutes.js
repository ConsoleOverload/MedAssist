import express from 'express';
import {
  listInvoices,
  createInvoice,
  recordPayment,
  getInvoiceById,
} from '../controllers/billingController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listInvoices);
router.get('/:id', getInvoiceById);
router.post('/', authorize('admin', 'receptionist'), createInvoice);
router.post('/:id/payments', authorize('admin', 'receptionist'), recordPayment);

export default router;
