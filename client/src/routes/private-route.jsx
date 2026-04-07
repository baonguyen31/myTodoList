import { STORAGE_KEYS } from '@/utilities/constants';
import { getCookie } from '@/utilities/services/storage.service';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const { AUTH_TOKEN } = STORAGE_KEYS;

export const PrivateRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getCookie(AUTH_TOKEN);

    if (token) setIsAuthenticated(true);

    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
