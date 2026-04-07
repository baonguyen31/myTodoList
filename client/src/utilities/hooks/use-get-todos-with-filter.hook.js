import { API_ENDPOINTS, PRIORITY_VALUES, STATUS_VALUES } from '@/utilities/constants';
import { todoApi } from '@/utilities/services/api.service';
import { handleUnauthorized } from '@/utilities/services/auth-utils.service';
import { message } from 'antd';

export const useGetTodosWithFilter = () => {
  const fetchTodosWithFilter = async ({ status, priority, dueDateBefore }) => {
    try {
      const params = {};

      if (status && status !== STATUS_VALUES.MY_TASKS) params.status = status;
      if (priority && priority !== PRIORITY_VALUES.ALL) params.priority = priority;
      if (dueDateBefore) params.dueDateBefore = dueDateBefore.toISOString();

      const response = await todoApi.get(API_ENDPOINTS.TODOS, { params });

      return response.data || [];
    } catch (e) {
      if (e.response?.status === 401) return handleUnauthorized();

      message.error('Failed to get tasks with filter', 1);

      return [];
    }
  };

  return {
    fetchTodosWithFilter,
  };
};
