import { Button } from '@/antd-components/button.component';
import { Menu } from '@/antd-components/menu.component';
import { COLORS } from '@/utilities/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

export const SideBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  border-right: 0.0625rem solid var(--divider-color);
  background-color: var(--item-background-color);
  min-height: 87vh;
  width: 15rem;
`;

export const HeaderTitle = styled.p`
  color: var(--primary-blue-color);
  font-weight: 500;
  font-size: 1.2rem;
`;

export const HeaderSubtitle = styled.p`
  color: var(--secondary-text-color);
  font-size: 0.8rem;
  font-weight: 400;
  margin-top: -1rem;
`;

export const CreateTaskButton = styled(Button)`
  background-color: var(--primary-blue-color);
  color: ${COLORS.WHITE};
  height: 3rem;
  width: 13rem;
  border: none;
  border-radius: 0.5rem;
  margin-bottom: 3rem;

  &:hover {
    color: ${COLORS.WHITE} !important;
    background-color: var(--hover-color) !important;
  }
`;

export const IconCreateTask = styled(FontAwesomeIcon)`
  color: ${COLORS.WHITE};
`;

export const SideBarHeader = styled.div`
  display: flex;
  flex-direction: column;
  height: 10.5rem;
  width: 100%;
`;

export const SideBarMenu = styled(Menu)`
  font-weight: 400;
  font-size: 0.9rem;
  margin-top: 1rem;
  border-right: none !important;
  background-color: var(--item-background-color) !important;

  .ant-menu-item {
    color: var(--primary-text-color) !important;
  }

  .ant-menu-item-selected {
    color: var(--primary-text-color) !important;
    background-color: var(--active-menu-button-color) !important;
  }
`;
