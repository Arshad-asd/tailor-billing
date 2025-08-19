import api from './api';

// Job Orders API
export const jobOrderAPI = {
  // Job Orders
  getJobOrders: (params) => api.get('/job-orders/job-orders/', { params }),
  getJobOrder: (id) => api.get(`/job-orders/job-orders/${id}/`),
  createJobOrder: (jobOrderData) => api.post('/job-orders/job-orders/', jobOrderData),
  updateJobOrder: (id, jobOrderData) => api.put(`/job-orders/job-orders/${id}/`, jobOrderData),
  deleteJobOrder: (id) => api.delete(`/job-orders/job-orders/${id}/`),
  updateJobOrderStatus: (id, status) => api.patch(`/job-orders/job-orders/${id}/status/`, { status }),
  assignJobOrder: (id, tailorId) => api.post(`/job-orders/job-orders/${id}/assign/`, { tailor_id: tailorId }),
  completeJobOrder: (id) => api.post(`/job-orders/job-orders/${id}/complete/`),
  
  // Measurements
  getMeasurements: (params) => api.get('/job-orders/measurements/', { params }),
  getMeasurement: (id) => api.get(`/job-orders/measurements/${id}/`),
  createMeasurement: (measurementData) => api.post('/job-orders/measurements/', measurementData),
  updateMeasurement: (id, measurementData) => api.put(`/job-orders/measurements/${id}/`, measurementData),
  deleteMeasurement: (id) => api.delete(`/job-orders/measurements/${id}/`),
  updateMeasurementDetails: (id, details) => api.patch(`/job-orders/measurements/${id}/update/`, details),
  
  // Dashboard and Reports
  getDashboardStats: () => api.get('/job-orders/dashboard/stats/'),
  getJobOrderReport: (params) => api.get('/job-orders/reports/job-orders/', { params }),
}; 