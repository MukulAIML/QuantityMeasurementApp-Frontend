import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (username, password) =>
  api.post('/auth/register', { username, password });

export const login = (username, password) =>
  api.post('/auth/login', { username, password });

// Quantity operations
const buildPayload = (
  value1, unit1, type1,
  value2 = 0, unit2 = unit1, type2 = type1
) => ({
  thisQuantityDTO: { value: parseFloat(value1), unit: unit1, measurementType: type1 },
  thatQuantityDTO: { value: parseFloat(value2), unit: unit2, measurementType: type2 },
});

export const compareQuantities = (v1, u1, t1, v2, u2, t2) =>
  api.post('/api/v1/quantities/compare', buildPayload(v1, u1, t1, v2, u2, t2));

export const convertQuantity = (value, fromUnit, type, toUnit) =>
  api.post('/api/v1/quantities/convert', buildPayload(value, fromUnit, type, 0, toUnit, type));

export const addQuantities = (v1, u1, t1, v2, u2, t2) =>
  api.post('/api/v1/quantities/add', buildPayload(v1, u1, t1, v2, u2, t2));

export const subtractQuantities = (v1, u1, t1, v2, u2, t2) =>
  api.post('/api/v1/quantities/subtract', buildPayload(v1, u1, t1, v2, u2, t2));

export const divideQuantities = (v1, u1, t1, v2, u2, t2) =>
  api.post('/api/v1/quantities/divide', buildPayload(v1, u1, t1, v2, u2, t2));

export const getHistory = () =>
  api.get('/api/v1/quantities/history');

export const getHistoryByOperation = (operation) =>
  api.get(`/api/v1/quantities/history/${operation}`);

export const getOperationCount = (operation) =>
  api.get(`/api/v1/quantities/count/${operation}`);

export default api;
