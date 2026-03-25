import api from './api';

export const getCompanies = async () => {
  const { data } = await api.get('/api/v1/companies');
  return data;
};

export const createCompany = async (payload) => {
  const { data } = await api.post('/api/v1/companies', payload);
  return data;
};

export const deleteCompany = async (id) => {
  const { data } = await api.delete(`/api/v1/companies/${id}`);
  return data;
};

export const getTransactions = async () => {
  const { data } = await api.get('/api/v1/transactions');
  return data;
};

export const createTransaction = async (payload) => {
  const { data } = await api.post('/api/v1/transactions', payload);
  return data;
};

export const updateTransaction = async (id, payload) => {
  const { data } = await api.put(`/api/v1/transactions/${id}`, payload);
  return data;
};

export const deleteTransaction = async (id) => {
  const { data } = await api.delete(`/api/v1/transactions/${id}`);
  return data;
};
