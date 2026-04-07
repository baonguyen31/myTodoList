import { PRIORITY_VALUES, STATUS_VALUES } from '@/utilities/constants';
import dayjs from 'dayjs';
import { trim } from 'lodash-es';

// Utility function to update status based on due date and completion status
export const updateStatusBasedOnDueDate = (dueDate, completed, form) => {
  if (dueDate && !completed) {
    const isOverdue = dayjs(dueDate).isBefore(dayjs());

    if (isOverdue) {
      form.setFieldsValue({ statusField: STATUS_VALUES.OVERDUE });
    } else {
      const currentStatus = form.getFieldValue('statusField');

      if (currentStatus === STATUS_VALUES.OVERDUE) form.setFieldsValue({ statusField: STATUS_VALUES.IN_PROGRESS });
    }
  }
};

// Utility function to get initial form values from selected task
export const getInitialFormValues = selectedRow => ({
  titleField: selectedRow?.title || '',
  descriptionField: selectedRow?.description || '',
  completedField: selectedRow?.status === STATUS_VALUES.COMPLETED || selectedRow?.completed || false,
  dueDateField: selectedRow?.dueDate ? dayjs(selectedRow.dueDate) : null,
  priorityField: selectedRow?.priority || PRIORITY_VALUES.MEDIUM,
  statusField: selectedRow?.status || STATUS_VALUES.PENDING,
});

// Utility function to create updated task object from form values
export const createUpdatedTask = (formValues, selectedRow) => {
  const { titleField, descriptionField, completedField, dueDateField, priorityField, statusField } = formValues;

  return {
    ...selectedRow,
    title: trim(titleField),
    description: trim(descriptionField) || null,
    completed: completedField || false,
    dueDate: dueDateField ? dueDateField.toISOString() : selectedRow.dueDate,
    priority: priorityField,
    status: statusField,
  };
};

// Utility function to handle status change and sync completion checkbox
export const handleStatusChange = (value, form) =>
  value === STATUS_VALUES.COMPLETED
    ? form.setFieldsValue({ completedField: true })
    : form.setFieldsValue({ completedField: false });

// Utility function to handle completion checkbox change and sync status
export const handleCompletionChange = (checked, form) => {
  if (checked) {
    form.setFieldsValue({ statusField: STATUS_VALUES.COMPLETED });
  } else {
    const dueDate = form.getFieldValue('dueDateField');
    updateStatusBasedOnDueDate(dueDate, false, form);
  }
};
