import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import { ATTRIBUTE_DATA, AUTH_ID, STORAGE_KEYS, THEME_MODES } from './utilities/constants';

const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
const initialTheme = savedTheme || THEME_MODES.DARK;

if (typeof document !== 'undefined') document.documentElement.setAttribute(ATTRIBUTE_DATA.DATA_THEME, initialTheme);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={AUTH_ID.GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
