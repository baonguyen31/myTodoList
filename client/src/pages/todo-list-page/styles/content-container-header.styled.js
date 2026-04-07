import { Button } from '@/antd-components/button.component';
import { DatePicker } from '@/antd-components/date-picker.component';
import { Dropdown } from '@/antd-components/dropdown.component';
import { COLORS } from '@/utilities/constants';
import styled from 'styled-components';

export const HeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 1rem 0.2rem;
  background-color: var(--item-background-color);
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const StatisticDropdown = styled(Dropdown)`
  text-align: right;
  margin-right: 0.5rem;
`;

export const StyledDatePicker = styled(DatePicker)`
  width: 20rem;
  margin-right: 0.3rem;
  border-radius: 0.5rem;
  background-color: var(--input-background-color);
  color: var(--primary-text-color);
  border-color: var(--divider-color);

  &:focus-within {
    border-color: var(--divider-color);
    background-color: var(--input-background-color);
    color: var(--primary-text-color);
  }

  .ant-picker-input > input {
    color: var(--primary-text-color) !important;
  }

  .ant-picker-suffix .anticon {
    color: var(--input-placeholder-color) !important;
  }

  .ant-picker-clear .anticon {
    color: var(--input-placeholder-color) !important;
  }

  .ant-picker-input > input::placeholder {
    color: var(--input-placeholder-color) !important;
  }

  &:hover {
    background-color: var(--input-background-color);
    border-color: var(--divider-color);
  }

  &.ant-picker-disabled {
    background-color: var(--input-background-color);
    cursor: not-allowed;
    border: 0.0625rem solid var(--divider-color);
    border-radius: 0.375rem;

    .ant-picker-input > input {
      color: var(--input-background-color) !important;
    }

    .ant-picker-suffix .anticon,
    .ant-picker-clear .anticon {
      color: var(--input-placeholder-color) !important;
    }
  }
`;

export const PriorityFilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const PriorityButton = styled.button`
  border: 0.0625rem solid var(--divider-color);
  background-color: ${({ active }) => (active ? 'var(--active-background-color)' : 'var(--input-background-color)')};
  color: ${({ active }) => (active ? `${COLORS.WHITE}` : 'var(--priority-text-color)')};
  border-radius: 0.5rem;
  padding: 0.5rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 5rem;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ active }) => (active ? 'none' : 'var(--divider-color)')};
    color: ${({ active }) => (active ? `${COLORS.WHITE}` : `${COLORS.WHITE}`)};
    background-color: ${({ active }) => (active ? 'var(--active-background-color)' : 'var(--active-background-color)')};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
export const DeleteAllButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  margin-left: 0.4rem;

  &:disabled {
    border-color: var(--divider-color) !important;
  }
`;
