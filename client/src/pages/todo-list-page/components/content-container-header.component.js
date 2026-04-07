import { Space } from '@/antd-components/space.component';
import { Button } from '@/antd-components/button.component';
import { PRIORITY_LEVELS, PRIORITY_VALUES } from '@/utilities/constants';
import { faArrowDown, faArrowUp, faList, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { map } from 'lodash-es';
import { useEffect, useState } from 'react';

import {
  DeleteAllButton,
  HeaderContainer,
  HeaderWrapper,
  PriorityButton,
  PriorityFilterContainer,
  StyledDatePicker,
} from '../styles/content-container-header.styled';

// Header component for the todo list application
export const ContentContainerHeader = ({
  hasCurrentTasks,
  currentPriority,
  currentDueDate,
  onFilterPriority,
  onFilterDueDate,
  onDeleteAllTasks,
}) => {
  const [filters, setFilters] = useState({
    completed: 0,
    dueDateBefore: null,
    priority: PRIORITY_VALUES.ALL,
  });

  const priorityButtons = [
    { key: PRIORITY_VALUES.ALL, label: PRIORITY_LEVELS.ALL, icon: faList },
    { key: PRIORITY_VALUES.HIGH, label: PRIORITY_LEVELS.HIGH, icon: faArrowUp },
    { key: PRIORITY_VALUES.MEDIUM, label: PRIORITY_LEVELS.MEDIUM, icon: faMinus },
    { key: PRIORITY_VALUES.LOW, label: PRIORITY_LEVELS.LOW, icon: faArrowDown },
  ];

  const handlePriorityChange = key => {
    const newFilters = { ...filters, priority: key };
    setFilters(newFilters);

    if (onFilterPriority) onFilterPriority(key);
  };

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priority: currentPriority,
      dueDateBefore: currentDueDate,
    }));
  }, [currentPriority, currentDueDate]);

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <Space direction="horizontal" size="small">
          <DeleteAllButton
            icon={<FontAwesomeIcon icon={faTrash} />}
            type="primary"
            danger
            onClick={onDeleteAllTasks}
            disabled={!hasCurrentTasks}
          />

          {/* <Button
            type="primary"
            onClick={onOpenAiModal}
          >
            AI Generate
          </Button> */}

          <PriorityFilterContainer>
            {map(priorityButtons, button => (
              <PriorityButton
                key={button.key || PRIORITY_VALUES.ALL}
                active={filters.priority === button.key}
                onClick={() => handlePriorityChange(button.key)}
                disabled={!hasCurrentTasks}
              >
                <Space align="center" size="small">
                  <FontAwesomeIcon icon={button.icon} />
                  {button.label}
                </Space>
              </PriorityButton>
            ))}
          </PriorityFilterContainer>
        </Space>

        <StyledDatePicker
          placeholder="Due date before"
          value={filters.dueDateBefore}
          onChange={date => {
            const newFilters = { ...filters, dueDateBefore: date };
            setFilters(newFilters);

            if (onFilterDueDate) onFilterDueDate(date);
          }}
          disabled={!hasCurrentTasks}
        />
      </HeaderContainer>
    </HeaderWrapper>
  );
};
