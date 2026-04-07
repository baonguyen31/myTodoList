import Cookies from 'js-cookie';

// Save data (auto stringify object, keep string as-is)
export const setLocalStorage = (key, value) => {
  const toSave = typeof value === 'string' ? value : JSON.stringify(value);
  window.localStorage.setItem(key, toSave);
};

// Get data (try parse JSON, fallback to raw string)
export const getLocalStorage = (key, defaultValue = null) => {
  const value = window.localStorage.getItem(key);

  if (!value) return defaultValue;

  try {
    return JSON.parse(value);
  } catch {
    return value; // plain string
  }
};

// New cookie-based functions for secure storage
export const setCookie = (key, value) => {
  const toSave = typeof value === 'string' ? value : JSON.stringify(value);

  Cookies.set(key, toSave, { expires: 1, secure: true, sameSite: 'strict' }); // Expires in 1 day, secure for HTTPS
};

export const getCookie = (key, defaultValue = null) => {
  const value = Cookies.get(key);

  if (!value) return defaultValue;

  try {
    return JSON.parse(value);
  } catch {
    return value; // plain string
  }
};

// Session versions (optional)
export const setSessionStorage = (key, value) => {
  const toSave = typeof value === 'string' ? value : JSON.stringify(value);
  window.sessionStorage.setItem(key, toSave);
};

export const getSessionStorage = (key, defaultValue = null) => {
  const value = window.sessionStorage.getItem(key);

  if (!value) return defaultValue;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
