import { useState } from 'react';
import { todoApi } from '@/utilities/services/api.service';
import { API_ENDPOINTS } from '@/utilities/constants';
import { handleUnauthorized } from '@/utilities/services/auth-utils.service';

export const useAutoGenerate = () => {

  // two pieces of state — loading spinner + error message
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // this is the function your button will call
  const generateTasks = async (formData) => {
    setIsLoading(true);   // show spinner
    setError(null);       // clear previous errors

    try {
      const response = await todoApi.post(
        API_ENDPOINTS.TODOS_AUTO_GENERATE,  // the URL
        formData                             // { source, prompt, maxTasks }
      );
      return response.data;  // return the list of created todos

    } catch (e) {
      if (e.response?.status === 401) return handleUnauthorized();
      setError(e.response?.data?.message || 'Something went wrong');

    } finally {
      setIsLoading(false);  // always hide spinner when done
    }
  };

  return { generateTasks, isLoading, error };
};