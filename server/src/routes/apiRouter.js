import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import patientRoutes from './patientRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import encounterRoutes from './encounterRoutes.js';
import prescriptionRoutes from './prescriptionRoutes.js';
import labRoutes from './labRoutes.js';
import billingRoutes from './billingRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import auditRoutes from './auditRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/doctors', doctorRoutes);
apiRouter.use('/departments', departmentRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/encounters', encounterRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/lab', labRoutes);
apiRouter.use('/billing', billingRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/audit', auditRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

// Health check
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MedAssist API',
    version: '1.0.0',
  });
});

export default apiRouter;
