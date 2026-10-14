import express from 'express';
import { listAuditLogs } from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', listAuditLogs);

export default router;
