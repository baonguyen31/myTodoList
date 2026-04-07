import { Button } from '@/antd-components/button.component';
import { Divider } from '@/antd-components/divider.component';
import { Image } from '@/antd-components/image.component';
import { TextField } from '@/antd-components/input.component';
import { Space } from '@/antd-components/space.component';
import { Typography } from '@/antd-components/typography.component';
import { COLORS } from '@/utilities/constants';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  overscroll-behavior: none;
  background-color: var(--main-background-color);
`;

export const LoginForm = styled.div`
  width: 100%;
  max-width: 25rem;
  padding: 2rem;
  background-color: var(--item-background-color);
  border-radius: 0.5rem;
  box-shadow: ${COLORS.BOX_SHADOW};
`;

export const FormTitle = styled.h2`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: var(--primary-blue-color);
`;

export const FormDescription = styled.p`
  margin-top: -0.2rem;
  font-size: 0.7rem;
  color: var(--secondary-text-color);
  font-style: italic;
  text-align: center;
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  white-space: nowrap;
`;

export const TodoImage = styled(Image)`
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.5rem;
`;

export const SocialImageButton = styled(Image)`
  width: 2rem !important;
  height: 2rem !important;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

export const FormButtonWrapper = styled.div`
  width: 100%;
  margin-top: 0.5rem;
`;

export const LoginButton = styled(Button)`
  height: 2.5rem;
  font-size: 1rem;
  background-color: var(--primary-blue-color);
  border-color: var(--divider-color);
  color: white;

  &:hover {
    background-color: var(--hover-color);
    border-color: var(--hover-color);
  }
`;

export const RegisterLink = styled(Typography.Link)`
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--primary-blue-color);
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1;

  &:hover {
    color: var(--hover-color);
  }
`;

export const FormFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const FormFooterText = styled.p`
  font-size: 0.9rem;
  margin: 0;
  color: var(--primary-text-color);
`;

export const StyledDivider = styled(Divider)`
  border-color: ${COLORS.FOG_GRAY} !important;
`;

export const DividerText = styled.p`
  font-size: 0.7rem;
  color: var(--secondary-text-color);
  font-weight: 500;
  margin: 0;
`;

export const EmailLabelWrapper = styled(Space)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: var(--primary-text-color);
`;

export const PasswordLabelWrapper = styled(Space)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: var(--primary-text-color);
`;

export const SocialLoginWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10rem;
`;

export const ForgotPasswordButton = styled(Typography.Link)`
  font-size: 0.85rem;
  color: var(--primary-blue-color);
  background-color: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  font-weight: 500;

  &:hover {
    color: var(--hover-color);
  }
`;

export const AuthTextField = styled(TextField)`
  width: 100%;
  background-color: var(--input-background-color) !important;
  border-color: var(--divider-color) !important;
  color: var(--primary-text-color) !important;

  &::placeholder {
    color: var(--input-placeholder-color) !important;
  }
`;

export const AuthPasswordField = styled(TextField.Password)`
  width: 100%;
  background-color: var(--input-background-color) !important;
  border-color: var(--divider-color) !important;
  color: var(--primary-text-color) !important;

  input {
    &::placeholder {
      color: var(--input-placeholder-color) !important;
    }
  }
`;
