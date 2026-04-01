import api from './api';

export const getEmployeeDashboard = async () => {
  const { data } = await api.get('/api/v1/employee/dashboard');
  return data;
};

export const getAttendanceHistory = async () => {
  const { data } = await api.get('/api/v1/employee/attendance');
  return data;
};

export const clockIn = async () => {
  const { data } = await api.post('/api/v1/employee/attendance/clock-in');
  return data;
};

export const clockOut = async () => {
  const { data } = await api.post('/api/v1/employee/attendance/clock-out');
  return data;
};

export const getLeaves = async () => {
  const { data } = await api.get('/api/v1/employee/leaves');
  return data;
};

export const applyLeave = async (payload) => {
  const { data } = await api.post('/api/v1/employee/leaves', payload);
  return data;
};

export const getAssets = async () => {
  const { data } = await api.get('/api/v1/employee/assets');
  return data;
};

export const getHolidays = async () => {
  const { data } = await api.get('/api/v1/employee/holidays');
  return data;
};

export const getAppreciations = async () => {
  const { data } = await api.get('/api/v1/employee/appreciations');
  return data;
};

export const sendAppreciation = async (payload) => {
  const { data } = await api.post('/api/v1/employee/appreciations', payload);
  return data;
};

export const deleteAppreciation = async (id) => {
  const { data } = await api.delete(`/api/v1/employee/appreciations/${id}`);
  return data;
};

export const addAppreciationComment = async (id, payload) => {
  const { data } = await api.post(`/api/v1/employee/appreciations/${id}/comments`, payload);
  return data;
};

export const getEmployees = async () => {
  const { data } = await api.get('/api/v1/employee/all-employees');
  return data;
};

export const getOffboardings = async () => {
  const { data } = await api.get('/api/v1/employee/offboarding');
  return data;
};

export const submitResignation = async (payload) => {
  const { data } = await api.post('/api/v1/employee/offboarding', payload);
  return data;
};

export const getExpenses = async () => {
  const { data } = await api.get('/api/v1/employee/expenses');
  return data;
};

export const submitExpense = async (payload) => {
  const { data } = await api.post('/api/v1/employee/expenses', payload);
  return data;
};

export const updateExpense = async (id, payload) => {
  const { data } = await api.put(`/api/v1/employee/expenses/${id}`, payload);
  return data;
};

export const deleteExpense = async (id) => {
  const { data } = await api.delete(`/api/v1/employee/expenses/${id}`);
  return data;
};

export const getPayslips = async () => {
  const { data } = await api.get('/api/v1/employee/payslips');
  return data;
};

export const getMyPayroll = async () => {
  const { data } = await api.get('/api/v1/employee/payroll');
  return data;
};

export const getMyPrePayments = async () => {
  const { data } = await api.get('/api/v1/employee/prepayments');
  return data;
};

export const createMyPrePayment = async (payload) => {
  const { data } = await api.post('/api/v1/employee/prepayments', payload);
  return data;
};

export const getMyIncrementPromotions = async () => {
  const { data } = await api.get('/api/v1/employee/increment-promotions');
  return data;
};

export const getPolicies = async () => {
  const { data } = await api.get('/api/v1/employee/policies');
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/api/v1/employee/profile');
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/api/v1/employee/profile', payload);
  return data;
};

export const updatePassword = async (payload) => {
  const { data } = await api.put('/api/v1/employee/profile/password', payload);
  return data;
};

// Letters
export const getLetters = async () => {
  const { data } = await api.get('/api/v1/employee/letters');
  return data;
};

export const updateLetter = async (id, payload) => {
  const { data } = await api.put(`/api/v1/employee/letters/${id}`, payload);
  return data;
};
