import { Image } from '@/antd-components/image.component';
import { TextField } from '@/antd-components/input.component';
import styled from 'styled-components';

export const TopBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 0.0625rem solid var(--divider-color);
  background-color: var(--item-background-color);
`;

export const Title = styled.h3`
  font-size: 1.5rem;
  color: var(--primary-blue-color);
`;

export const StyledTextField = styled(TextField)`
  width: 20rem;
  height: 2.3rem;
  border-radius: 0.5rem;
  margin-left: 0.5rem;
  border-color: var(--divider-color);
  background-color: var(--input-background-color);
  color: var(--primary-text-color);

  &:hover {
    background-color: var(--input-background-color);
    border-color: var(--divider-color);
  }

  &:focus-within {
    border-color: var(--divider-color);
    background-color: var(--input-background-color);
    color: var(--primary-text-color);
  }

  .ant-input {
    color: var(--primary-text-color);
  }

  .ant-input::placeholder {
    color: var(--input-placeholder-color);
  }

  @media (max-width: 768px) {
    width: 10rem;
  }
`;

export const TodoImage = styled(Image)`
  width: 2rem !important;
  height: 2rem !important;
`;
