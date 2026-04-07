import { Descriptions } from '@/antd-components/descriptions.component';
import { Modal } from '@/antd-components/modal.component';
import { PRIORITY_LEVELS, STATUS_TYPES } from '@/utilities/constants';
import { formatDate } from '@/utilities/services/format-date.service';

// ViewTaskDetailsModal component to display task details
export const ViewTaskDetailsModal = ({ isOpen, task, onClose }) => {
  if (!task) return null;

  const items = [
    {
      key: 'title',
      label: 'Title',
      children: task.title,
    },
    {
      key: 'description',
      label: 'Description',
      children: task.description ? <div style={{ whiteSpace: 'pre-wrap' }}>{task.description}</div> : null,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      children: formatDate(task.dueDate),
    },
    {
      key: 'priority',
      label: 'Priority',
      children: PRIORITY_LEVELS[task.priority] || '-',
    },
    {
      key: 'status',
      label: 'Status',
      children: STATUS_TYPES[task.status] || STATUS_TYPES.PENDING,
    },
    {
      key: 'completed',
      label: 'Completed',
      children: task.completed ? 'Yes' : 'No',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      children: formatDate(task.createdAt),
    },
    {
      key: 'updatedAt',
      label: 'Updated At',
      children: formatDate(task.updatedAt),
    },
  ];

  return (
    <Modal title="Task Details" open={isOpen} onCancel={onClose} footer={null} width={600}>
      <Descriptions bordered column={1} items={items} size="small" />
    </Modal>
  );
};
