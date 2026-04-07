import { Spin } from '@/antd-components/spin.component';
import { Table } from '@/antd-components/table.component';
import { map } from 'lodash-es';
import { useState } from 'react';

import { getTodoTableColumns } from '../config/todo-table-columns.config';
import { StyledTable, TableWrapper } from '../styles/todo-list-table.styled';
import { EditTaskModal } from './edit-task-modal.component';

const { Column } = Table;

// TodoList component that displays the list of tasks in a table
export const TodoListTable = ({
  todoList,
  isLoading,
  onComplete,
  onDelete,
  onUpdateTask,
  onViewDetails,
  onActionMenuOpenChange,
}) => {
  const [editRowId, setEditRowId] = useState(null);

  // Function to select a row for updating
  const handleSelectRowToUpdate = id => setEditRowId(id);

  // Function to close the edit modal
  const handleCloseEditModal = () => setEditRowId(null);

  const columns = getTodoTableColumns(
    editRowId,
    EditTaskModal,
    onViewDetails,
    handleSelectRowToUpdate,
    onComplete,
    onDelete,
    onUpdateTask,
    handleCloseEditModal,
    onActionMenuOpenChange,
  );

  return (
    <TableWrapper>
      <StyledTable
        loading={{
          spinning: isLoading,
          indicator: <Spin />,
        }}
        dataSource={todoList}
        onChange={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        {map(columns, column => (
          <Column key={column.key} {...column} />
        ))}
      </StyledTable>
    </TableWrapper>
  );
};
