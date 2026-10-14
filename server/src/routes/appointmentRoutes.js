import express from 'express';
import {
  listAppointments,
  bookAppointment,
  updateAppointmentStatus,
  getWaitingQueue,
} from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listAppointments);
router.get('/queue', authorize('admin', 'doctor', 'receptionist'), getWaitingQueue);
router.post('/book', bookAppointment);
router.patch('/:id/status', authorize('admin', 'doctor', 'receptionist'), updateAppointmentStatus);

export default router;
