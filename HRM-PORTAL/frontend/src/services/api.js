import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shnoor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('shnoor_token');
      localStorage.removeItem('shnoor_role');
      localStorage.removeItem('shnoor_email');
      localStorage.removeItem('shnoor_admin_email');
    }
    return Promise.reject(error);
  }
);

export default api;
