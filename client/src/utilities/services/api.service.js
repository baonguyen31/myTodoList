import axios from 'axios';

import { STORAGE_KEYS } from '../constants';
import { handleUnauthorized } from './auth-utils.service';
import { getCookie } from './storage.service';

const { AUTH_TOKEN } = STORAGE_KEYS;

// Create axios instance for Todo API
export const todoApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add token to Todo API requests
todoApi.interceptors.request.use(config => {
  const token = getCookie(AUTH_TOKEN);

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

// Add response interceptor to handle 401 errors globally
todoApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) handleUnauthorized();

    return Promise.reject(error);
  },
);
