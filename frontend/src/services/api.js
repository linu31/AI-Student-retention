import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const ML_SERVICE_URL = import.meta.env.VITE_AI_URL;

// Create axios instances
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mlApi = axios.create({
  baseURL: ML_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Student API calls
export const studentAPI = {
  // Get all students with optional filters
  getAllStudents: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/students${params ? `?${params}` : ''}`);
  },

  // Get single student
  getStudent: (id) => api.get(`/students/${id}`),

  // Upload students from CSV
  uploadStudents: (formData) => {
    return api.post('/students/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get risk statistics
  getRiskStats: () => api.get('/students/stats/risk'),

  // Update student
  updateStudent: (id, data) => api.put(`/students/${id}`, data),

  // Delete student
  deleteStudent: (id) => api.delete(`/students/${id}`),

  // Bulk delete students
  bulkDeleteStudents: (studentIds) => api.post('/students/bulk-delete', { studentIds }),
};

// ML Service API calls
export const mlAPI = {
  // Analyze single student
  analyzeStudent: (studentId) => api.post(`/ml/analyze/${studentId}`),

  // Analyze all students
  analyzeAllStudents: () => api.post('/ml/analyze-all'),

  // Get career recommendation
  getCareerRecommendation: (studentId) => api.get(`/ml/career/${studentId}`),

  // Get personalized advice
  getPersonalizedAdvice: (studentId) => api.get(`/ml/advice/${studentId}`),

  // Get adaptive learning path
  getAdaptiveLearningPath: (studentId) => api.get(`/ml/learning-path/${studentId}`),

  // Direct ML service calls (bypassing backend)
  predictRiskDirect: (studentData) => mlApi.post('/predict-risk', studentData),
  recommendCareerDirect: (studentData) => mlApi.post('/recommend-career', studentData),
  getAdviceDirect: (studentData) => mlApi.post('/personalized-advice', studentData),
  getLearningPathDirect: (studentData) => mlApi.post('/adaptive-learning', studentData),
};

// Notification API calls
export const notificationAPI = {
  // Get all notifications
  getAllNotifications: () => api.get('/notifications'),

  // Get notification stats
  getNotificationStats: () => api.get('/notifications/stats'),

  // Get student notifications
  getStudentNotifications: (studentId) => api.get(`/notifications/student/${studentId}`),

  // Send manual warning
  sendManualWarning: (studentId, customMessage) => 
    api.post('/notifications/send-warning', { studentId, customMessage }),

  // Schedule risk check
  scheduleRiskCheck: () => api.post('/notifications/schedule-check'),

  // Resend notification
  resendNotification: (notificationId) => api.post(`/notifications/resend/${notificationId}`),

  // Delete notification
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    return api.post('/auth/logout');
  },
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { oldPassword, newPassword }),
};

// Dashboard API calls
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getRiskTrends: (period = 'week') => api.get(`/dashboard/risk-trends?period=${period}`),
  getDepartmentStats: () => api.get('/dashboard/department-stats'),
};

// Export all APIs
const API = {
  student: studentAPI,
  ml: mlAPI,
  notification: notificationAPI,
  auth: authAPI,
  dashboard: dashboardAPI,
};

export default API;
