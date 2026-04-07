import { Button } from '@/antd-components/button.component';
import { Dropdown } from '@/antd-components/dropdown.component';
import { Space } from '@/antd-components/space.component';
import { ThemeSelector } from '@/pages/todo-list-page/components/theme-selector.component';
import { useTodoList } from '@/utilities/hooks/use-todo-list.hook';
import { CloseCircleFilled } from '@ant-design/icons';
import { faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isEmpty } from 'lodash-es';
import { useState } from 'react';

import { StyledTextField, Title, TodoImage, TopBarContainer } from './styles/top-bar.styled';

export const TopBar = ({ onResetOriginalData, onSearchTasksByName }) => {
  const { userMenuItems } = useTodoList();
  const [input, setInput] = useState('');

  // Function to handle input change and trigger search immediately
  const handleInputChange = e => {
    const value = e.target.value;
    setInput(value);

    if (value.trim() === '') return onResetOriginalData();

    onSearchTasksByName(value);
  };

  return (
    <TopBarContainer>
      <Space>
        <TodoImage preview={false} src="/icons8-to-do-list-48.png" alt="Todo Icon" />
        <Title>Workday Task Tracker</Title>
      </Space>

      <Space>
        <StyledTextField
          placeholder="Search tasks..."
          onChange={handleInputChange}
          value={input}
          prefix={
            <FontAwesomeIcon
              style={{ marginRight: '0.5rem', color: 'var(--input-placeholder-color)' }}
              icon={faSearch}
            />
          }
          suffix={
            !isEmpty(input) && (
              <CloseCircleFilled
                style={{ color: 'var(--input-placeholder-color)', cursor: 'pointer' }}
                onClick={() => {
                  setInput('');
                  onResetOriginalData();
                }}
              />
            )
          }
        />

        <ThemeSelector />

        <Dropdown menu={{ items: userMenuItems }} arrow placement="bottomRight">
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faUser} style={{ fontSize: '1.1rem', color: 'var(--primary-text-color)' }} />}
          />
        </Dropdown>
      </Space>
    </TopBarContainer>
  );
};
