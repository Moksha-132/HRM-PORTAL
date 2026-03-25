import api from './api';

export const getHeaderSettings = async () => {
  const { data } = await api.get('/api/v1/settings/header');
  return data;
};

export const updateHeaderSettings = async (payload) => {
  const { data } = await api.put('/api/v1/settings/header', payload);
  return data;
};

export const getAboutSettings = async () => {
  const { data } = await api.get('/api/v1/settings/about');
  return data;
};

export const updateAboutSettings = async (payload) => {
  const { data } = await api.put('/api/v1/settings/about', payload);
  return data;
};

export const getContactSettings = async () => {
  const { data } = await api.get('/api/v1/settings/contact');
  return data;
};

export const updateContactSettings = async (payload) => {
  const { data } = await api.put('/api/v1/settings/contact', payload);
  return data;
};

export const getFeatures = async () => {
  const { data } = await api.get('/api/v1/settings/features');
  return data;
};

export const addFeature = async (payload) => {
  const { data } = await api.post('/api/v1/settings/features', payload);
  return data;
};

export const deleteFeature = async (id) => {
  const { data } = await api.delete(`/api/v1/settings/features/${id}`);
  return data;
};

export const getPricing = async () => {
  const { data } = await api.get('/api/v1/settings/pricing');
  return data;
};

export const addPricing = async (payload) => {
  const { data } = await api.post('/api/v1/settings/pricing', payload);
  return data;
};

export const deletePricing = async (id) => {
  const { data } = await api.delete(`/api/v1/settings/pricing/${id}`);
  return data;
};
