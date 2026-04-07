import { STORAGE_KEYS } from '@/utilities/constants';
import { getLocalStorage } from '@/utilities/services/storage.service';
import { createContext, useContext, useState } from 'react';

const { USER_ACCOUNT } = STORAGE_KEYS;

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => getLocalStorage(USER_ACCOUNT));

  return <UserContext.Provider value={{ userProfile, setUserProfile }}>{children}</UserContext.Provider>;
};

export const useUserProvider = () => useContext(UserContext);
