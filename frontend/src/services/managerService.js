import api from './api';

export const getManagerDashboard = async () => {
  const { data } = await api.get('/api/v1/manager/dashboard');
  return data;
};

export const getEmployees = async () => {
  const { data } = await api.get('/api/v1/manager/employees');
  return data;
};

export const createEmployee = async (payload) => {
  const { data } = await api.post('/api/v1/manager/employees', payload);
  return data;
};

export const updateEmployee = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/employees/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/employees/${id}`);
  return data;
};

export const getAttendance = async () => {
  const { data } = await api.get('/api/v1/manager/attendance');
  return data;
};

export const createAttendance = async (payload) => {
  const { data } = await api.post('/api/v1/manager/attendance', payload);
  return data;
};

export const updateAttendance = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/attendance/${id}`, payload);
  return data;
};

export const deleteAttendance = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/attendance/${id}`);
  return data;
};

export const getLeaves = async () => {
  const { data } = await api.get('/api/v1/manager/leaves');
  return data;
};

export const updateLeave = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/leaves/${id}`, payload);
  return data;
};

export const deleteLeave = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/leaves/${id}`);
  return data;
};

export const getAssets = async () => {
  const { data } = await api.get('/api/v1/manager/assets');
  return data;
};

export const createAsset = async (payload) => {
  const { data } = await api.post('/api/v1/manager/assets', payload);
  return data;
};

export const updateAsset = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/assets/${id}`, payload);
  return data;
};

export const deleteAsset = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/assets/${id}`);
  return data;
};

export const getPayroll = async () => {
  const { data } = await api.get('/api/v1/manager/payroll');
  return data;
};

export const createPayroll = async (payload) => {
  const { data } = await api.post('/api/v1/manager/payroll', payload);
  return data;
};

export const updatePayroll = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/payroll/${id}`, payload);
  return data;
};

export const deletePayroll = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/payroll/${id}`);
  return data;
};

export const generatePayslip = async (id) => {
  const { data } = await api.post(`/api/v1/manager/payroll/${id}/generate-payslip`);
  return data;
};

export const getAppreciations = async () => {
  const { data } = await api.get('/api/v1/manager/appreciations');
  return data;
};

export const createAppreciation = async (payload) => {
  const { data } = await api.post('/api/v1/manager/appreciations', payload);
  return data;
};

export const updateAppreciation = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/appreciations/${id}`, payload);
  return data;
};

export const deleteAppreciation = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/appreciations/${id}`);
  return data;
};

export const getPolicies = async () => {
  const { data } = await api.get('/api/v1/manager/policies');
  return data;
};

export const createPolicy = async (payload) => {
  const { data } = await api.post('/api/v1/manager/policies', payload);
  return data;
};

export const updatePolicy = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/policies/${id}`, payload);
  return data;
};

export const deletePolicy = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/policies/${id}`);
  return data;
};

export const getOffboardings = async () => {
  const { data } = await api.get('/api/v1/manager/offboardings');
  return data;
};

export const createOffboarding = async (payload) => {
  const { data } = await api.post('/api/v1/manager/offboardings', payload);
  return data;
};

export const updateOffboarding = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/offboardings/${id}`, payload);
  return data;
};

export const deleteOffboarding = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/offboardings/${id}`);
  return data;
};

export const getExpenses = async () => {
  const { data } = await api.get('/api/v1/manager/expenses');
  return data;
};

export const createExpense = async (payload) => {
  const { data } = await api.post('/api/v1/manager/expenses', payload);
  return data;
};

export const updateExpense = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/expenses/${id}`, payload);
  return data;
};

export const deleteExpense = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/expenses/${id}`);
  return data;
};

export const getHolidays = async () => {
  const { data } = await api.get('/api/v1/manager/holidays');
  return data;
};

export const createHoliday = async (payload) => {
  const { data } = await api.post('/api/v1/manager/holidays', payload);
  return data;
};

export const updateHoliday = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/holidays/${id}`, payload);
  return data;
};

export const deleteHoliday = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/holidays/${id}`);
  return data;
};

// Letters
export const getLetters = async () => {
  const { data } = await api.get('/api/v1/manager/letters');
  return data;
};

export const sendLetter = async (payload) => {
  const { data } = await api.post('/api/v1/manager/letters', payload);
  return data;
};

export const updateLetter = async (id, payload) => {
  const { data } = await api.put(`/api/v1/manager/letters/${id}`, payload);
  return data;
};

export const deleteLetter = async (id) => {
  const { data } = await api.delete(`/api/v1/manager/letters/${id}`);
  return data;
};
