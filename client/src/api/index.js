import { api } from './client.js';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout', {}),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const patientApi = {
  list: (params = '') => api.get(`/patients?${params}`),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  getTimeline: (id) => api.get(`/patients/${id}/timeline`),
};

export const doctorApi = {
  list: (params = '') => api.get(`/doctors?${params}`),
  getById: (id) => api.get(`/doctors/${id}`),
  getSlots: (id, date) => api.get(`/doctors/${id}/slots?date=${date}`),
  updateAvailability: (id, schedules) => api.put(`/doctors/${id}/availability`, { schedules }),
};

export const appointmentApi = {
  list: (params = '') => api.get(`/appointments?${params}`),
  getQueue: (params = '') => api.get(`/appointments/queue?${params}`),
  book: (data) => api.post('/appointments/book', data),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
};

export const encounterApi = {
  getByAppointment: (appointmentId) => api.get(`/encounters/appointment/${appointmentId}`),
  saveDraft: (id, data) => api.put(`/encounters/${id}/draft`, data),
  finalize: (id) => api.post(`/encounters/${id}/finalize`, {}),
  generateAISummary: (id) => api.post(`/encounters/${id}/ai-summary`, {}),
  approveAISummary: (id, approvedText) => api.post(`/encounters/${id}/ai-summary/approve`, { approvedText }),
};

export const prescriptionApi = {
  list: (params = '') => api.get(`/prescriptions?${params}`),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  explainAI: (id) => api.post(`/prescriptions/${id}/explain-ai`, {}),
};

export const labApi = {
  listOrders: (params = '') => api.get(`/lab?${params}`),
  getById: (id) => api.get(`/lab/${id}`),
  createOrder: (data) => api.post('/lab', data),
  collectSample: (id, accessionNumber) => api.patch(`/lab/${id}/collect-sample`, { accessionNumber }),
  startProcessing: (id) => api.patch(`/lab/${id}/start-processing`, {}),
  enterResults: (id, data) => api.post(`/lab/${id}/enter-results`, data),
  verifyResults: (id) => api.patch(`/lab/${id}/verify`, {}),
  releaseResults: (id) => api.patch(`/lab/${id}/release`, {}),
};

export const billingApi = {
  listInvoices: (params = '') => api.get(`/billing?${params}`),
  getById: (id) => api.get(`/billing/${id}`),
  createInvoice: (data) => api.post('/billing', data),
  recordPayment: (id, data) => api.post(`/billing/${id}/payments`, data),
};

export const notificationApi = {
  getMy: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`, {}),
};

export const adminApi = {
  listUsers: (params = '') => api.get(`/users?${params}`),
  createStaff: (data) => api.post('/users/staff', data),
  toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`, {}),
  listDepartments: () => api.get('/departments'),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
  listServices: (params = '') => api.get(`/services?${params}`),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  listAuditLogs: (params = '') => api.get(`/audit?${params}`),
};
