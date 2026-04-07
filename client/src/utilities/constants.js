import { MoneyCollectFilled } from '@ant-design/icons';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { keyBy } from 'lodash-es';

// API endpoints and paths
export const API_ENDPOINTS = Object.freeze({
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  TODOS: '/todos',
  TODO_BY_ID: '/todos/{id}',
  LOGOUT: '/auth/logout',
  TODOS_AUTO_GENERATE: '/todos/auto-generate',
  GOOGLE_LOGIN: '/auth/google',
  FACEBOOK_LOGIN: '/auth/facebook',
});

export const PAGE_PATH = Object.freeze({
  TODO_LIST: '/todos',
  LOGIN: '/login',
  REGISTER: '/register',
});



// Storage keys
export const STORAGE_KEYS = Object.freeze({
  COMPANY_USER: 'company-user',
  PERSONAL_USER: 'personal-user',
  AUTH_TOKEN: 'auth_token',
  NEW_SIGN_REQUEST: 'new-sign-request',
  NEW_TEMPLATE: 'new-template',
  CREATED_SIGN_REQUEST_TEMPALTE: 'created-sign-request-template',
  EDIT_TEMPLATE: 'edit-template',
  EDIT_TEMPLATE_SUCCESS_MESSAGE: 'edit-template-success-message',
  NEW_TEMPLATE_SUCCESS_MESSAGE: 'new-template-success-message',
  CLONE_TEMPLATE_SUCCESS_MESSAGE: 'clone-template-success-message',
  TRIGGER_SIGN_REQUEST: 'trigger-sign-request',
  START_DATE: 'start-date',
  END_DATE: 'end-date',
  TODO_LIST: 'todoList',
  ORIGINAL_LIST: 'originalList',
  THEME: 'theme',
  USER_ACCOUNT: 'user-account',
});

export const PRIORITY_LEVELS = Object.freeze({
  ALL: 'All',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
});

export const STATUS_TYPES = Object.freeze({
  MY_TASKS: 'My Tasks',
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  OVERDUE: 'Overdue',
});

export const PRIORITY_VALUES = Object.freeze({
  ALL: 'ALL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
});

export const STATUS_VALUES = Object.freeze({
  MY_TASKS: 'MY_TASKS',
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  OVERDUE: 'OVERDUE',
});

// Theme constants
export const ATTRIBUTE_DATA = Object.freeze({
  DATA_THEME: 'data-theme',
});

export const THEME_MODES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
});

export const THEME_OPTIONS = [
  { mode: THEME_MODES.LIGHT, icon: faSun },
  { mode: THEME_MODES.DARK, icon: faMoon },
];

export const THEME_OPTIONS_HASH = keyBy(THEME_OPTIONS, 'mode');

// UI constants
export const CUSTOM_NOTIFICATION = Object.freeze({
  pauseOnHover: false,
  duration: 1,
  closeIcon: false,
});

export const MODAL_TITLES = Object.freeze({
  DELETE_A_TASK: 'Are you sure you want to delete this task?',
  DELETE_ALL_TASKS: 'Are you sure you want to delete all tasks?',
});

export const COLORS = Object.freeze({
  // NEUTRAL COLORS
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GHOST_WHITE: '#f8fafc',

  // BLUE COLORS
  BRIGHT_BLUE: '#1677ff',
  BLUE: '#4096ff',
  BLUE_GREEN: '#249995',
  DARK_BLUE: '#003a8c',

  // GRAY COLORS
  FOG_GRAY: '#726f6f75',
  DARK_GRAY: '#3b3b3b',
  LIGHT_GRAY: '#e6e6e6',
  MEDIUM_GRAY: '#666',
  GRAY_LIGHT_D9: '#d9d9d9',

  // PINK COLORS
  DARK_PINK: '#70114b',
  DEEP_PINK: '#ca077e',

  // RED COLORS
  RED: 'red',

  // GREEN COLORS
  GREEN: 'green',
  BRIGHT_GREEN: '#47e247',
  TEAL_GREEN: '#008060',
  MEDIUM_TEAL_GREEN: '#069e70ff',
  LIGHT_TEAL_GREEN: '#77b4a5ff',

  // YELLOW COLORS
  CYBER_YELLOW: '#ffd809',

  // SHADE COLORS
  BLACK_55: 'rgb(0 0 0 / 55%)',
  GRAY_55: '#7f7f7f55',

  // SHADOW
  BOX_SHADOW: '0 0 3.125rem rgba(0, 0, 0, 0.18), 0 0.125rem 0.4375rem rgba(0, 0, 0, 0.5)',
});

export const AUTH_ID = Object.freeze({
  GOOGLE_CLIENT_ID: '631241229433-9eumlhji2vg8aimnv50qgrjaj3bb3u2p.apps.googleusercontent.com',
  FACEBOOK_APP_ID: '554442523971007',
});
