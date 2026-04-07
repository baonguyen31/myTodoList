import { DatePicker } from '@/antd-components/date-picker.component';
import { Form } from '@/antd-components/form.component';
import { TextField } from '@/antd-components/input.component';
import { message } from '@/antd-components/message.component';
import { Modal } from '@/antd-components/modal.component';
import { Select } from '@/antd-components/select.component';
import { API_ENDPOINTS, PRIORITY_LEVELS, PRIORITY_VALUES, STATUS_TYPES, STATUS_VALUES } from '@/utilities/constants';
import { todoApi } from '@/utilities/services/api.service';
import { trim } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';

// AddTodoModal component for adding a new task
export const AddTodoModal = ({ isOpen, onAddNewTodo, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const titleRef = useRef(null);

  // Function to handle the add button click and validate form
  const handleAddButtonClick = async () => {
    try {
      const formValue = await form.validateFields();
      const { titleField, descriptionField, dueDateField, priorityField, statusField } = formValue;

      setIsLoading(true);

      const newTask = {
        title: trim(titleField),
        description: trim(descriptionField) || null,
        dueDate: dueDateField ? dueDateField.toISOString() : null,
        priority: priorityField,
        status: statusField,
      };

      const response = await todoApi.post(API_ENDPOINTS.TODOS, newTask);

      message.success('Task added successfully!', 1);
      onAddNewTodo(response.data);
      onClose();
      form.resetFields();
    } catch (e) {
      if (e.errorFields) return;

      if (e.response?.status === 401) return handleUnauthorized();

      message.error('Failed to add a new task!', 1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && titleRef.current) titleRef.current.focus();
  }, [isOpen]);

  return (
    <Modal
      title="Add New Task"
      open={isOpen}
      closable={!isOpen}
      okText="Add"
      cancelText="Cancel"
      onOk={handleAddButtonClick}
      onCancel={onClose}
      okButtonProps={{ loading: isLoading }}
      width={600}
      style={{ marginTop: '-3rem' }}
    >
      <Form
        form={form}
        name="addTodoForm"
        layout="vertical"
        onFinish={handleAddButtonClick}
        style={{ marginTop: '1.5rem' }}
        initialValues={{
          titleField: '',
          descriptionField: '',
          dueDateField: null,
          priorityField: PRIORITY_VALUES.MEDIUM,
          statusField: STATUS_VALUES.PENDING,
        }}
      >
        <Form.Item
          label="Task Title"
          name="titleField"
          rules={[
            {
              required: true,
              message: 'Please enter the task title!',
            },
            {
              type: 'string',
              whitespace: true,
              message: 'Title cannot be empty!',
            },
          ]}
        >
          <TextField ref={titleRef} type="text" placeholder="Enter a task title..." />
        </Form.Item>

        <Form.Item
          label="Description"
          name="descriptionField"
          rules={[
            {
              type: 'string',
              whitespace: true,
            },
          ]}
        >
          <TextField.TextArea
            showCount
            placeholder="Enter task description..."
            rows={3}
            maxLength={500}
            style={{ resize: 'vertical' }}
          />
        </Form.Item>

        <Form.Item
          label="Due Date"
          name="dueDateField"
          rules={[
            {
              required: true,
              message: 'Please select due date!',
            },
          ]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="Select due date" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Priority"
          name="priorityField"
          rules={[
            {
              required: true,
              message: 'Please select priority!',
            },
          ]}
        >
          <Select placeholder="Select priority" style={{ width: '100%' }}>
            <Select.Option value={PRIORITY_VALUES.HIGH}>{PRIORITY_LEVELS.HIGH}</Select.Option>
            <Select.Option value={PRIORITY_VALUES.MEDIUM}>{PRIORITY_LEVELS.MEDIUM}</Select.Option>
            <Select.Option value={PRIORITY_VALUES.LOW}>{PRIORITY_LEVELS.LOW}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Status"
          name="statusField"
          rules={[
            {
              required: true,
              message: 'Please select status!',
            },
          ]}
        >
          <Select placeholder="Select status" style={{ width: '100%' }}>
            <Select.Option value={STATUS_VALUES.PENDING}>{STATUS_TYPES.PENDING}</Select.Option>
            <Select.Option value={STATUS_VALUES.IN_PROGRESS}>{STATUS_TYPES.IN_PROGRESS}</Select.Option>
            <Select.Option value={STATUS_VALUES.COMPLETED}>{STATUS_TYPES.COMPLETED}</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
