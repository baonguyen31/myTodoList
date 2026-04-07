import { ConfirmDeletionModal } from '@/pages/todo-list-page/components/confirm-deletion-modal.component';
import {
  API_ENDPOINTS,
  MODAL_TITLES,
  PAGE_PATH,
  PRIORITY_VALUES,
  STATUS_VALUES,
  STORAGE_KEYS,
} from '@/utilities/constants';
import { useGetTodosWithFilter } from '@/utilities/hooks/use-get-todos-with-filter.hook';
import { useGetTodos } from '@/utilities/hooks/use-get-todos.hook';
import { todoApi } from '@/utilities/services/api.service';
import { handleUnauthorized } from '@/utilities/services/auth-utils.service';
import { setLocalStorage } from '@/utilities/services/storage.service';
import { removeVietnameseTones } from '@/utilities/services/text-processing.service';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { message } from 'antd';
import Cookies from 'js-cookie';
import { filter, find, isEmpty, map } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { TODO_LIST, ORIGINAL_LIST } = STORAGE_KEYS;
const { DELETE_ALL_TASKS, DELETE_A_TASK } = MODAL_TITLES;

export const useTodoList = () => {
  const navigate = useNavigate();
  const [todoList, setTodoList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [searchedList, setSearchedList] = useState([]);
  const [currentStatusFilter, setCurrentStatusFilter] = useState(STATUS_VALUES.MY_TASKS);
  const [currentPriorityFilter, setCurrentPriorityFilter] = useState(PRIORITY_VALUES.ALL);
  const [currentDueDateFilter, setCurrentDueDateFilter] = useState(null);
  const [viewTask, setViewTask] = useState(null);

  const { todos: fetchedTodos, isLoading } = useGetTodos();
  const { fetchTodosWithFilter } = useGetTodosWithFilter();

  const doesTaskMatchCurrentFilter = updatedTask => {
    if (currentStatusFilter !== STATUS_VALUES.MY_TASKS && updatedTask.status !== currentStatusFilter) return false;
    if (currentPriorityFilter !== PRIORITY_VALUES.ALL && updatedTask.priority !== currentPriorityFilter) return false;
    // Currently due date filter is handled by backend; keep existing in-view tasks as-is for simplicity.
    return true;
  };

  const invalidateTaskInList = updatedTask => list => {
    const filtered = filter(list, item => item.id !== updatedTask.id);

    if (doesTaskMatchCurrentFilter(updatedTask)) return [{ ...updatedTask }, ...filtered];

    return filtered;
  };

  // Function to view task details
  const handleViewTaskDetails = task => setViewTask(task);

  // Function to close view details modal
  const handleCloseViewModal = () => setViewTask(null);

  // Function to toggle the completion status of a task
  const handleCompleteTask = async id => {
    const todo = find(todoList, task => task.id === id);

    if (!todo) return;

    const newStatus = todo.status === STATUS_VALUES.COMPLETED ? STATUS_VALUES.IN_PROGRESS : STATUS_VALUES.COMPLETED;

    try {
      await todoApi.put(API_ENDPOINTS.TODO_BY_ID.replace('{id}', id), {
        title: todo.title,
        description: todo.description,
        status: newStatus,
        completed: newStatus === STATUS_VALUES.COMPLETED,
        dueDate: todo.dueDate,
        priority: todo.priority,
      });

      const updatedTaskInList = find(todoList, task => task.id === id);

      if (!updatedTaskInList) return;

      const updatedTaskObject = {
        ...updatedTaskInList,
        completed: newStatus === STATUS_VALUES.COMPLETED,
        status: newStatus,
      };

      const updatedOriginalList = invalidateTaskInList(updatedTaskObject)(originalList);
      const updatedTodoList = invalidateTaskInList(updatedTaskObject)(todoList);
      const updatedSearchedList = invalidateTaskInList(updatedTaskObject)(searchedList);

      setTodoList(updatedTodoList);
      setSearchedList(updatedSearchedList);
      setOriginalList(updatedOriginalList);

      message.success('Update the task status successfully!', 1);
    } catch (e) {
      if (e.response?.status === 401) return handleUnauthorized();

      message.error('Failed to update task status', 1);
    }
  };

  // Function to reset todo list to original data
  const handleResetOriginalData = () => {
    if (isEmpty(originalList)) return;

    setTodoList(originalList);
    setSearchedList([]);
  };

  // Function to add a new task to the todo list
  const handleAddNewTodo = newTask => {
    setTodoList(prev => [newTask, ...prev]);
    setOriginalList(prev => [newTask, ...prev]);
  };


  //========================== Auto-generate tasks ==========================
  const handleAddGeneratedTodos = (newTasks) => {
    setTodoList(prev => [...newTasks, ...prev]);
    setOriginalList(prev => [...newTasks, ...prev]);
  
  };



  // Function to search tasks by name
  const handleSearchTasksByName = name => {
    const searchName = removeVietnameseTones(name.trim());

    if (!searchName) return;

    const found = filter(originalList, todo => removeVietnameseTones(todo.title).includes(searchName));

    setTodoList(found);
    setSearchedList(found);
  };

  // Function to filter tasks by status from backend (supports status + priority)
  const handleFilterStatus = async status => {
    if (status === currentStatusFilter) return;

    setCurrentStatusFilter(status);
    setCurrentPriorityFilter(PRIORITY_VALUES.ALL);
    setCurrentDueDateFilter(null);

    const fetched = await fetchTodosWithFilter({
      status,
      priority: PRIORITY_VALUES.ALL,
      dueDateBefore: null,
    });

    setTodoList(fetched);
    setOriginalList(fetched);
    setSearchedList([]);
  };

  // Function to filter tasks by priority from backend (supports status + priority)
  const handleFilterPriority = async priority => {
    if (priority === currentPriorityFilter) return;

    setCurrentPriorityFilter(priority);

    const fetched = await fetchTodosWithFilter({
      status: currentStatusFilter,
      priority,
      dueDateBefore: currentDueDateFilter,
    });

    setTodoList(fetched);
    setOriginalList(fetched);
    setSearchedList([]);
  };

  // Function to filter tasks by due date from backend
  const handleFilterDueDate = async dueDate => {
    setCurrentDueDateFilter(dueDate);

    const fetched = await fetchTodosWithFilter({
      status: currentStatusFilter,
      priority: currentPriorityFilter,
      dueDateBefore: dueDate,
    });

    setTodoList(fetched);
    setOriginalList(fetched);
    setSearchedList([]);
  };

  // Function to update the task
  const handleUpdateTask = async updatedTask => {
    try {
      await todoApi.put(API_ENDPOINTS.TODO_BY_ID.replace('{id}', updatedTask.id), updatedTask);

      const updatedOriginalList = invalidateTaskInList(updatedTask)(originalList);
      const updatedTodoList = invalidateTaskInList(updatedTask)(todoList);
      const updatedSearchedList = invalidateTaskInList(updatedTask)(searchedList);

      setTodoList(updatedTodoList);
      setSearchedList(updatedSearchedList);
      setOriginalList(updatedOriginalList);

      message.success('Update the task successfully!', 1);
    } catch (e) {
      if (e.response?.status === 401) return handleUnauthorized();

      message.error('Failed to update the task!', 1);
    }
  };

  // Function to delete a specific task
  const handleDeleteTask = id => {
    ConfirmDeletionModal({
      onOk: async () => {
        try {
          const response = await todoApi.delete(API_ENDPOINTS.TODO_BY_ID.replace('{id}', id));

          const deleteItem = list => filter(list, todo => todo.id !== id);

          const updatedTodoList = deleteItem(todoList);
          const updatedSearchedList = deleteItem(searchedList);
          const updatedOriginalList = deleteItem(originalList);

          setTodoList(updatedTodoList);
          setOriginalList(updatedOriginalList);
          setSearchedList(updatedSearchedList);

          message.success(response.data?.message, 1);
        } catch (e) {
          if (e.response?.status === 401) return handleUnauthorized();

          message.error(e.response?.data?.error, 1);
        }
      },
      title: DELETE_A_TASK,
    });
  };

  // Function to delete all tasks
  const handleDeleteAllTasks = async () => {
    ConfirmDeletionModal({
      onOk: async () => {
        try {
          const response = await todoApi.delete(API_ENDPOINTS.TODOS);

          setTodoList([]);
          setOriginalList([]);
          setSearchedList([]);

          message.success(response.data?.message, 1);
        } catch (e) {
          if (e.response?.status === 401) return handleUnauthorized();

          message.error(e.response?.data?.error, 1);
        }
      },
      title: DELETE_ALL_TASKS,
    });
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <FontAwesomeIcon icon={faSignOutAlt} />,
      label: 'Logout',
      onClick: async () => {
        try {
          const response = await todoApi.post(API_ENDPOINTS.LOGOUT);

          message.success(response.data.message, 1);
          Cookies.remove(STORAGE_KEYS.AUTH_TOKEN);
          navigate(PAGE_PATH.LOGIN, { replace: true });
        } catch (e) {
          message.error(e.response?.data?.error, 1);
        }
      },
      danger: true,
    },
  ];

  useEffect(() => {
    if (!isLoading && fetchedTodos.length > 0) {
      setTodoList(fetchedTodos);
      setOriginalList(fetchedTodos);
    }
  }, [fetchedTodos, isLoading]);

  useEffect(() => {
    setLocalStorage(TODO_LIST, [...todoList]);
    setLocalStorage(ORIGINAL_LIST, [...originalList]);
  }, [todoList, originalList]);

  return {
    todoList,
    fetchedTodos,
    isLoading,
    viewTask,
    currentPriorityFilter,
    currentDueDateFilter,
    handleViewTaskDetails,
    handleCloseViewModal,
    handleCompleteTask,
    handleResetOriginalData,
    handleAddNewTodo,
    handleSearchTasksByName,
    handleFilterStatus,
    handleFilterPriority,
    handleFilterDueDate,
    handleUpdateTask,
    handleDeleteTask,
    handleDeleteAllTasks,
    userMenuItems,
    handleAddGeneratedTodos,  // Auto-generate tasks 
  };
};
