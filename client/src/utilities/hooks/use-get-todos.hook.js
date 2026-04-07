import { API_ENDPOINTS, STORAGE_KEYS } from '@/utilities/constants';
import { todoApi } from '@/utilities/services/api.service';
import { getLocalStorage } from '@/utilities/services/storage.service';
import { isEmpty } from 'lodash-es';
import { useEffect, useState } from 'react';

import { handleUnauthorized } from '../services/auth-utils.service';

const { TODO_LIST, ORIGINAL_LIST } = STORAGE_KEYS;

// Custom hook to fetch todos from API with fallback to localStorage
export const useGetTodos = () => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await todoApi.get(API_ENDPOINTS.TODOS);

        !isEmpty(response?.data)
          ? setTodos(response?.data)
          : setTodos(getLocalStorage(ORIGINAL_LIST) || getLocalStorage(TODO_LIST) || []);
      } catch (e) {
        if (e.response?.status === 401) return handleUnauthorized();

        setTodos(getLocalStorage(ORIGINAL_LIST) || getLocalStorage(TODO_LIST) || []);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { todos, isLoading };
};
