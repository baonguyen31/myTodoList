import { getLocalStorage, setLocalStorage } from '@/utilities/services/storage.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { some } from 'lodash-es';
import { useState } from 'react';
import styled from 'styled-components';

import {
  ATTRIBUTE_DATA,
  STORAGE_KEYS,
  THEME_MODES,
  THEME_OPTIONS,
  THEME_OPTIONS_HASH,
} from '../../../utilities/constants';

const { LIGHT, DARK } = THEME_MODES;
const { THEME } = STORAGE_KEYS;
const { DATA_THEME } = ATTRIBUTE_DATA;

const ThemeButton = styled(FontAwesomeIcon)`
  cursor: pointer;
  margin: 0.5rem;
  color: var(--theme-button-color);
  width: 1rem;
`;

// Theme selector component that toggles between light and dark themes
export const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const currentTheme = getLocalStorage(THEME);

    const response = some(THEME_OPTIONS, data => data.mode === currentTheme) ? currentTheme : LIGHT;
    document.documentElement.setAttribute(DATA_THEME, response);

    return response;
  });

  // Function to toggle between light and dark themes
  const handleToggleTheme = () => {
    const newTheme = currentTheme === LIGHT ? DARK : LIGHT;

    document.documentElement.setAttribute(DATA_THEME, newTheme);
    setLocalStorage(THEME, newTheme);
    setCurrentTheme(newTheme);
  };

  return <ThemeButton key={currentTheme} icon={THEME_OPTIONS_HASH[currentTheme].icon} onClick={handleToggleTheme} />;
};
