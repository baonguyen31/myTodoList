import { Checkbox } from '@/antd-components/checkbox.component';
import { Form } from '@/antd-components/form.component';
import { message } from '@/antd-components/message.component';
import { Space } from '@/antd-components/space.component';
import { API_ENDPOINTS, AUTH_ID, PAGE_PATH, STORAGE_KEYS } from '@/utilities/constants';
import { todoApi } from '@/utilities/services/api.service';
import { setCookie } from '@/utilities/services/storage.service';
import { useGoogleLogin } from '@react-oauth/google';
import { useEffect, useRef, useState } from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { useNavigate } from 'react-router-dom';

import {
  AuthPasswordField,
  AuthTextField,
  DividerText,
  EmailLabelWrapper,
  ForgotPasswordButton,
  FormButtonWrapper,
  FormDescription,
  FormFooter,
  FormFooterText,
  FormTitle,
  LoginButton,
  LoginForm,
  PasswordLabelWrapper,
  RegisterLink,
  SocialImageButton,
  SocialLoginWrapper,
  StyledDivider,
  TitleWrapper,
  TodoImage,
  Wrapper,
} from './styles/login-page.styled';

const { AUTH_TOKEN } = STORAGE_KEYS;

// Login page component with email and password fields, login and register buttons
export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const emailRef = useRef(null);

  const navigate = useNavigate();

  const handleLogin = async values => {
    setIsLoading(true);

    try {
      const apiResponse = await todoApi.post(API_ENDPOINTS.LOGIN, {
        email: values.email,
        password: values.password,
      });

      message.success('Login successfully!', 1);

      setCookie(AUTH_TOKEN, apiResponse.data.token);
      navigate(PAGE_PATH.TODO_LIST, { replace: true });
    } catch (e) {
      message.error(e.response.data?.error, 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async googleResponse => {
    const accessToken = googleResponse?.access_token;

    if (!accessToken) return message.error('Google authentication failed: missing token', 1);

    setIsLoading(true);

    try {
      const apiResponse = await todoApi.post(API_ENDPOINTS.GOOGLE_LOGIN, { accessToken });

      message.success('Login successfully!', 1);
      setCookie(AUTH_TOKEN, apiResponse.data.token);
      navigate(PAGE_PATH.TODO_LIST, { replace: true });
    } catch (e) {
      message.error(e.response.data?.error, 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async facebookResponse => {
    const { accessToken, userID: userId } = facebookResponse;

    if (!accessToken || !userId) return message.error('Facebook authentication failed.', 1);

    setIsLoading(true);

    try {
      const apiResponse = await todoApi.post(API_ENDPOINTS.FACEBOOK_LOGIN, {
        accessToken,
        userId,
      });

      message.success('Login successfully!', 1);
      setCookie(AUTH_TOKEN, apiResponse.data.token);
      navigate(PAGE_PATH.TODO_LIST, { replace: true });
    } catch (e) {
      message.error(e.response.data?.error, 1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

  return (
    <Wrapper>
      <LoginForm>
        <Form form={form} name="loginForm" layout="vertical" onFinish={handleLogin} autoComplete="off">
          <FormTitle>
            <TitleWrapper>
              <TodoImage preview={false} src="/icons8-to-do-list-48.png" alt="Todo Icon" />
              Welcome back
            </TitleWrapper>

            <FormDescription>Enter your credentials to access your workspace</FormDescription>
          </FormTitle>

          <Form.Item
            label={<EmailLabelWrapper size={270}>Email</EmailLabelWrapper>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <AuthTextField ref={emailRef} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label={
              <PasswordLabelWrapper size={270}>
                Password
                <ForgotPasswordButton onClick={() => message.info('Forgot password flow is coming soon!', 1)}>
                  Forgot?
                </ForgotPasswordButton>
              </PasswordLabelWrapper>
            }
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <AuthPasswordField placeholder="Enter your password" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" style={{ marginTop: -15 }}>
            <Checkbox style={{ color: 'var(--primary-text-color)' }}>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <FormButtonWrapper>
              <LoginButton type="primary" htmlType="submit" loading={isLoading} block>
                Login
              </LoginButton>
            </FormButtonWrapper>
          </Form.Item>

          <StyledDivider plain>
            <DividerText>OR CONTINUE WITH</DividerText>
          </StyledDivider>

          <SocialLoginWrapper>
            <Space direction="vertical" align="center" style={{ color: 'var(--primary-text-color)' }}>
              <SocialImageButton
                preview={false}
                onClick={useGoogleLogin({
                  onSuccess: handleGoogleLogin,
                  onError: () => message.error('Google sign-in failed', 1),
                  flow: 'implicit',
                })}
                src="/google.png"
                alt="Google icon"
              />
              Google
            </Space>

            <FacebookLogin
              appId={AUTH_ID.FACEBOOK_APP_ID}
              fields="name,email,picture"
              callback={handleFacebookLogin}
              onFailure={() => message.error('Facebook sign-in failed', 1)}
              render={({ onClick }) => (
                <Space direction="vertical" align="center" style={{ color: 'var(--primary-text-color)' }}>
                  <SocialImageButton onClick={onClick} preview={false} src="/facebook.png" alt="Facebook icon" />
                  Facebook
                </Space>
              )}
            />
          </SocialLoginWrapper>
        </Form>
      </LoginForm>

      <FormFooter>
        <FormFooterText>Don't have an account ?</FormFooterText>

        <RegisterLink onClick={() => navigate(PAGE_PATH.REGISTER)}>Register</RegisterLink>
      </FormFooter>
    </Wrapper>
  );
};
