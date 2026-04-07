import { Menu } from '@/antd-components/menu.component';
import { Space } from '@/antd-components/space.component';
import { AddTodoModal } from '@/pages/todo-list-page/components/add-todo-modal.component';
import { STATUS_TYPES, STATUS_VALUES } from '@/utilities/constants';
import {
  faArrowTrendUp,
  faCheckCircle,
  faExclamationTriangle,
  faHourglassHalf,
  faList,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import {
  CreateTaskButton,
  HeaderSubtitle,
  HeaderTitle,
  IconCreateTask,
  SideBarContainer,
  SideBarHeader,
  SideBarMenu,
} from './styles/side-bar.styled';

export const SideBar = ({ onAddNewTodo, onFilterStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(STATUS_VALUES.MY_TASKS);

  // Function to open add todo modal
  const handleOpenAddModal = () => setIsModalOpen(true);

  // Function to close add todo modal
  const handleCloseAddModal = () => setIsModalOpen(false);

  return (
    <SideBarContainer>
      <SideBarHeader>
        <Space direction="vertical" style={{ marginLeft: '1.5em' }} size={0}>
          <HeaderTitle>Task Manager</HeaderTitle>
          <HeaderSubtitle>Productivity Workspace</HeaderSubtitle>
        </Space>

        <SideBarMenu
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={item => {
            setSelectedMenu(item.key);
            if (onFilterStatus) onFilterStatus(item.key);
          }}
        >
          <Menu.Item key={STATUS_VALUES.MY_TASKS} icon={<FontAwesomeIcon icon={faList} />}>
            {STATUS_TYPES.MY_TASKS}
          </Menu.Item>
          <Menu.Item key={STATUS_VALUES.PENDING} icon={<FontAwesomeIcon icon={faHourglassHalf} />}>
            {STATUS_TYPES.PENDING}
          </Menu.Item>
          <Menu.Item key={STATUS_VALUES.IN_PROGRESS} icon={<FontAwesomeIcon icon={faArrowTrendUp} />}>
            {STATUS_TYPES.IN_PROGRESS}
          </Menu.Item>
          <Menu.Item key={STATUS_VALUES.COMPLETED} icon={<FontAwesomeIcon icon={faCheckCircle} />}>
            {STATUS_TYPES.COMPLETED}
          </Menu.Item>
          <Menu.Item key={STATUS_VALUES.OVERDUE} icon={<FontAwesomeIcon icon={faExclamationTriangle} />}>
            {STATUS_TYPES.OVERDUE}
          </Menu.Item>
        </SideBarMenu>
      </SideBarHeader>

      <CreateTaskButton type="text" onClick={() => handleOpenAddModal()}>
        <Space align="center">
          <IconCreateTask icon={faPlus} />
          Create a new task
        </Space>
      </CreateTaskButton>

      <AddTodoModal isOpen={isModalOpen} onAddNewTodo={onAddNewTodo} onClose={handleCloseAddModal} />
    </SideBarContainer>
  );
};
