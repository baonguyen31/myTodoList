import { COLORS } from '@/utilities/constants';
import styled from 'styled-components';

export const Wrapper = styled.div`
  background-color: var(--main-background-color);
  color: var(--primary-text-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  overscroll-behavior: none;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--item-background-color);
  border: 0.0625rem solid var(--divider-color);
  padding: 0 0.5rem;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  width: 78.3rem;
  flex: 1;
  min-height: calc(100.5vh - 120px);
  max-height: calc(100.5vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  overscroll-behavior: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;
