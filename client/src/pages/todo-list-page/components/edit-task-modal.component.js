import { Checkbox } from '@/antd-components/checkbox.component';
import { DatePicker } from '@/antd-components/date-picker.component';
import { Form } from '@/antd-components/form.component';
import { Input } from '@/antd-components/input.component';
import { TextField } from '@/antd-components/input.component';
import { Modal } from '@/antd-components/modal.component';
import { COLORS, PRIORITY_LEVELS, PRIORITY_VALUES, STATUS_TYPES, STATUS_VALUES } from '@/utilities/constants';
import { useEffect, useRef, useState } from 'react';

import {
  createUpdatedTask,
  getInitialFormValues,
  handleCompletionChange,
  handleStatusChange,
  updateStatusBasedOnDueDate,
} from '../utils/edit-task-utils';

// EditTaskModal component for updating all task fields
export const EditTaskModal = ({ isOpen, selectedRow, onUpdateTask, onCloseEditModal }) => {
  const [hasChanged, setHasChanged] = useState(false);
  const [form] = Form.useForm();
  const titleRef = useRef(null);

  // Function to handle the update button click and validate form
  const handleUpdateButtonClick = selectedRow => {
    form
      .validateFields()
      .then(formValue => {
        const updatedTask = createUpdatedTask(formValue, selectedRow);

        onUpdateTask(updatedTask);
        onCloseEditModal();
      })
      .catch(e => {
        if (e.errorFields) return;
      });
  };

  useEffect(() => {
    if (isOpen && titleRef.current) titleRef.current.focus();
  }, [isOpen]);

  return (
    <Modal
      title="Edit Task"
      open={isOpen}
      closable={!isOpen}
      okText="Update"
      cancelText="Cancel"
      onOk={() => handleUpdateButtonClick(selectedRow)}
      onCancel={onCloseEditModal}
      okButtonProps={{ disabled: !hasChanged }}
      width={600}
      style={{ marginTop: '-3rem' }}
    >
      <Form
        form={form}
        name="editTaskForm"
        layout="vertical"
        onFinish={() => handleUpdateButtonClick(selectedRow)}
        style={{ marginTop: '1.5rem' }}
        initialValues={getInitialFormValues(selectedRow)}
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
          <TextField
            ref={titleRef}
            type="text"
            placeholder="Enter a task title..."
            onChange={() => setHasChanged(true)}
          />
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
          <Input.TextArea
            showCount
            placeholder="Enter task description..."
            rows={3}
            maxLength={500}
            style={{ resize: 'vertical' }}
            onChange={() => setHasChanged(true)}
          />
        </Form.Item>

        <Form.Item label="Due Date" name="dueDateField">
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="Select due date"
            style={{ width: '100%' }}
            onChange={value => {
              setHasChanged(true);
              const completed = form.getFieldValue('completedField');
              updateStatusBasedOnDueDate(value, completed, form);
            }}
          />
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
          <select
            disabled={selectedRow?.status === STATUS_VALUES.OVERDUE}
            style={{
              width: '100%',
              padding: '0.25rem 0.6875rem',
              border: `0.0625rem solid ${COLORS.GRAY_LIGHT_D9}`,
              borderRadius: '0.375rem',
            }}
            onChange={() => setHasChanged(true)}
          >
            <option value={PRIORITY_VALUES.HIGH}>{PRIORITY_LEVELS.HIGH}</option>
            <option value={PRIORITY_VALUES.MEDIUM}>{PRIORITY_LEVELS.MEDIUM}</option>
            <option value={PRIORITY_VALUES.LOW}>{PRIORITY_LEVELS.LOW}</option>
          </select>
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
          <select
            disabled={selectedRow?.status === STATUS_VALUES.OVERDUE}
            style={{
              width: '100%',
              padding: '0.25rem 0.6875rem',
              border: `0.0625rem solid ${COLORS.GRAY_LIGHT_D9}`,
              borderRadius: '0.375rem',
            }}
            onChange={e => {
              setHasChanged(true);
              handleStatusChange(e.target.value, form);
            }}
          >
            <option value={STATUS_VALUES.PENDING}>{STATUS_TYPES.PENDING}</option>
            <option value={STATUS_VALUES.IN_PROGRESS}>{STATUS_TYPES.IN_PROGRESS}</option>
            <option value={STATUS_VALUES.COMPLETED}>{STATUS_TYPES.COMPLETED}</option>
            <option value={STATUS_VALUES.OVERDUE}>{STATUS_TYPES.OVERDUE}</option>
          </select>
        </Form.Item>

        <Form.Item name="completedField" valuePropName="checked">
          <Checkbox
            disabled={selectedRow?.status === STATUS_VALUES.OVERDUE}
            onChange={e => {
              setHasChanged(true);
              handleCompletionChange(e.target.checked, form);
            }}
          >
            Mark as completed
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};
