/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { FormGroup, Label, Input, Form } from 'reactstrap';
import { FacebookLoginButton } from 'react-social-login-buttons';
import Utils from '../../Utils';
import UserStore from './UserStore';

interface ILoginModalBodyProp {
  loginBtnText: string;
  isLoading: boolean;
  onSuccess: () => void;
  toggleLoginAndRegister: () => void;
}

interface ILoginModalBodyStates {
  emailInput: string;
  passwordInput: string;
  errorMsg: string;
}

class LoginModalBody extends React.Component<
  ILoginModalBodyProp,
  ILoginModalBodyStates
> {
  private onSuccess: () => void;

  private toggleLoginAndRegister: () => void;

  constructor(props: ILoginModalBodyProp) {
    super(props);
    this.state = {
      emailInput: '',
      passwordInput: '',
      errorMsg: '',
    };
    const { onSuccess, toggleLoginAndRegister } = this.props;
    this.onSuccess = onSuccess;
    this.toggleLoginAndRegister = toggleLoginAndRegister;
  }

  onLoginBtnClicked = async () => {
    const { emailInput, passwordInput } = this.state;
    if (!emailInput) {
      return;
    }
    if (!passwordInput) {
      return;
    }
    const userInfo = UserStore as any;
    try {
      console.log('client fetch start');

      const res = await Utils.fetch('/api/login', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          emailInput,
          passwordInput,
        }),
      });
      const result = await res.json();
      console.log('client result', result);
      if (result && result.success) {
        userInfo.isLoggedIn = true;
        userInfo.displayName = result.username;
        userInfo.email = result.email;
        userInfo.id = result.user_id;
        // hide the modal
        this.onSuccess();
      } else if (result && !result.success) {
        userInfo.isLoggedIn = false;
        userInfo.displayName = '';
        userInfo.email = '';
        userInfo.id = '';
        // reset form here
        console.log('cannot log in');
        this.setState({ errorMsg: 'cannot log in' });
      }
      this.setState({ errorMsg: result.message });
    } catch (error) {
      console.log('error in loggin', error);
      // reset form
      this.setState({ errorMsg: 'server error' });
    }
  };

  setInputValue(propertyName: string, val: string) {
    const valTrimmed = val.trim();
    if (propertyName === 'passwordInput') {
      this.setState({
        passwordInput: valTrimmed,
      });
    } else if (propertyName === 'emailInput') {
      this.setState({
        emailInput: valTrimmed,
      });
    } else {
      console.log('error property', propertyName);
    }
    console.log('val', val);
  }

  onSubmitLoginForm = (event: any) => {
    event.preventDefault();
    this.onLoginBtnClicked();
  };

  render() {
    const { isLoading, loginBtnText } = this.props;
    const { emailInput, passwordInput, errorMsg } = this.state;
    const linkStyle = {
      color: 'blue',
    };
    return (
      <div>
        <Form onSubmit={this.onSubmitLoginForm}>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Email"
              value={emailInput || ''}
              onChange={(val) => {
                this.setInputValue('emailInput' as any, val.target.value);
              }}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Password"
              value={passwordInput || ''}
              onChange={(val) => {
                this.setInputValue('passwordInput' as any, val.target.value);
              }}
              required
            />
            <small className="text-danger">{errorMsg}</small>
          </FormGroup>

          <Input
            className="btn-lg btn-block btn-primary"
            disabled={isLoading}
            type="submit"
          >
            {loginBtnText}
          </Input>
        </Form>
        <div className="text-center pt-3">
          Or continue with your social account
        </div>
        <FacebookLoginButton className="mt-3 mb-3" />
        <div className="text-center mb-3">
          <span
            role="button"
            onClick={() => {
              this.toggleLoginAndRegister();
            }}
            onKeyPress={this.toggleLoginAndRegister}
            style={linkStyle}
          >
            Sign Up
          </span>
          <span className="p-2">|</span>
          <a href="/sign-up">Forgot Password</a>
        </div>
      </div>
    );
  }
}

export default LoginModalBody;
