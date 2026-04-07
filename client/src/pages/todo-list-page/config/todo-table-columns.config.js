import { Button } from '@/antd-components/button.component';
import { Dropdown } from '@/antd-components/dropdown.component';
import { PRIORITY_LEVELS, STATUS_TYPES, STATUS_VALUES } from '@/utilities/constants';
import { formatDate } from '@/utilities/services/format-date.service';
import { formatDescription, truncateText } from '@/utilities/services/text-format.service';
import { faCheck, faEdit, faEllipsisV, faEye, faRedo, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { RowName } from '../styles/todo-list-table.styled';

// Column configurations for the TodoListTable
export const getTodoTableColumns = (
  editRowId,
  EditTaskModal,
  onViewDetails,
  onSelectRowToUpdate,
  onComplete,
  onDelete,
  onUpdateTask,
  onCloseEditModal,
  onActionMenuOpenChange,
) => [
  {
    align: 'center',
    title: 'No.',
    width: 55,
    key: 'index',
    render: (_, __, index) => index + 1,
  },
  {
    title: <p style={{ textAlign: 'center' }}>Title</p>,
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
    render: (title, record) => (
      <RowName>
        {editRowId === record.id && (
          <EditTaskModal
            isOpen={editRowId}
            selectedRow={record}
            onUpdateTask={onUpdateTask}
            onCloseEditModal={onCloseEditModal}
          />
        )}
        <span
          style={{
            color:
              record.status === STATUS_VALUES.OVERDUE
                ? 'var(--overdue-item-color)'
                : record.status === STATUS_VALUES.COMPLETED
                  ? 'var(--completed-item-color)'
                  : 'inherit',
            fontWeight:
              record.status === STATUS_VALUES.OVERDUE
                ? 500
                : record.status === STATUS_VALUES.COMPLETED
                  ? 500
                  : 'normal',
            textDecoration: record.status === STATUS_VALUES.COMPLETED ? 'line-through' : 'none',
          }}
        >
          {truncateText(title)}
        </span>
      </RowName>
    ),
  },
  {
    title: <p style={{ textAlign: 'center' }}>Description</p>,
    dataIndex: 'description',
    key: 'description',
    render: description => <span>{formatDescription(description)}</span>,
  },
  {
    align: 'center',
    title: 'Priority',
    dataIndex: 'priority',
    key: 'priority',
    width: 85,
    render: priority => <span>{PRIORITY_LEVELS[priority]}</span>,
  },
  {
    align: 'center',
    title: 'Status',
    dataIndex: 'status',
    width: 110,
    key: 'status',
    render: (status, record) => {
      let color =
        record.status === STATUS_VALUES.OVERDUE
          ? 'var(--overdue-item-color)'
          : record.status === STATUS_VALUES.COMPLETED
            ? 'var(--completed-item-color)'
            : 'inherit';

      let fontWeight =
        record.status === STATUS_VALUES.COMPLETED || record.status === STATUS_VALUES.OVERDUE ? 500 : 'normal';

      return <span style={{ color, fontWeight }}>{STATUS_TYPES[status] || STATUS_TYPES.PENDING}</span>;
    },
  },
  {
    title: <p style={{ textAlign: 'center' }}>Due Date</p>,
    dataIndex: 'dueDate',
    width: 180,
    key: 'dueDate',
    render: dueDate => <span>{formatDate(dueDate)}</span>,
  },
  {
    title: <p style={{ textAlign: 'center' }}>Created At</p>,
    dataIndex: 'createdAt',
    width: 180,
    key: 'createdAt',
    render: createdAt => <span>{formatDate(createdAt)}</span>,
  },
  {
    title: <p style={{ textAlign: 'center' }}>Updated At</p>,
    dataIndex: 'updatedAt',
    width: 180,
    key: 'updatedAt',
    render: updatedAt => <span>{formatDate(updatedAt)}</span>,
  },
  {
    align: 'center',
    title: 'Actions',
    key: 'actions',
    width: 80,
    render: (_, record) => {
      const menuItems = [
        {
          key: 'view',
          icon: <FontAwesomeIcon icon={faEye} />,
          label: 'View details',
          onClick: () => onViewDetails(record),
        },
        {
          key: 'edit',
          icon: <FontAwesomeIcon icon={faEdit} />,
          label: 'Edit',
          onClick: () => onSelectRowToUpdate(record.id),
        },
        {
          key: 'complete',
          icon: <FontAwesomeIcon icon={record.status === STATUS_VALUES.COMPLETED ? faRedo : faCheck} />,
          label: record.status === STATUS_VALUES.COMPLETED ? 'Mark as incompleted' : 'Mark as completed',
          onClick: () => onComplete(record.id),
          disabled: record.status === STATUS_VALUES.OVERDUE,
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          icon: <FontAwesomeIcon icon={faTrash} />,
          label: 'Delete',
          onClick: () => onDelete(record.id),
          danger: true,
        },
      ];

      return (
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['click']}
          placement="bottomRight"
          arrow
          onOpenChange={isOpen => onActionMenuOpenChange(record.id, isOpen)}
        >
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faEllipsisV} style={{ color: 'var(--primary-text-color)' }} />}
          />
        </Dropdown>
      );
    },
  },
];
