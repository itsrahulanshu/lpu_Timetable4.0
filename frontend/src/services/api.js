/**
 * API Service
 * Handles all backend API calls
 */

import axios from 'axios';

// Auto-detect API URL: same domain in production, localhost in dev
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

/**
 * Get cached timetable data
 */
export const getTimetable = async () => {
  const response = await api.get('/timetable');
  return response.data;
};

/**
 * Refresh timetable data
 */
export const refreshTimetable = async () => {
  const response = await api.post('/timetable/refresh');
  return response.data;
};

/**
 * Get cache status
 */
export const getTimetableStatus = async () => {
  const response = await api.get('/timetable/status');
  return response.data;
};

export default api;
