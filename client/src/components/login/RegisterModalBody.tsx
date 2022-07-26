/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { FormGroup, Label, Input, Form } from 'reactstrap';
import Utils from '../../Utils';
import UserStore from './UserStore';

interface IRegisterModalBodyProp {
  onSuccess: () => void;
  toggleLoginAndRegister: () => void;
}

interface IRegisterModalBodyStates {
  emailInput: string;
  passwordInput: string;
  passwordInput2: string;
  errorMsg: string;
}

class RegisterModalBody extends React.Component<
  IRegisterModalBodyProp,
  IRegisterModalBodyStates
> {
  private onSuccess: () => void;

  private toggleLoginAndRegister: () => void;

  constructor(props: IRegisterModalBodyProp) {
    super(props);
    this.state = {
      emailInput: '',
      passwordInput: '',
      passwordInput2: '',
      errorMsg: '',
    };
    const { onSuccess, toggleLoginAndRegister } = this.props;
    this.onSuccess = onSuccess;
    this.toggleLoginAndRegister = toggleLoginAndRegister;
  }

  setInputValue(propertyName: string, val: string) {
    const valTrimmed = val.trim();
    if (propertyName === 'passwordInput') {
      this.setState({
        passwordInput: valTrimmed,
      });
    } else if (propertyName === 'passwordInput2') {
      this.setState({
        passwordInput2: valTrimmed,
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

  onRegisterBtnClicked = async () => {
    const { emailInput, passwordInput, passwordInput2 } = this.state;
    console.log('register btn clicked', emailInput, passwordInput);
    if (!emailInput) {
      return;
    }
    if (!passwordInput) {
      return;
    }
    if (!passwordInput2) {
      return;
    }
    if (passwordInput !== passwordInput2) {
      console.log('mismatched passwords');
      this.setState({
        errorMsg: 'mismatched passwords',
      });
      return;
    }
    const userInfo = UserStore as any;
    try {
      console.log('client fetch start');

      const res = await Utils.fetch('/api/register', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
        }),
      });
      const result = await res.json();
      console.log('client result', result);
      if (result && result.success) {
        userInfo.isLoggedIn = true;
        userInfo.displayName = result.emailInput;
        // hide the modal
        this.onSuccess();
      } else if (result && !result.success) {
        userInfo.isLoggedIn = false;
        userInfo.displayName = '';
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

  onSubmitLoginForm = (event: any) => {
    event.preventDefault();
    this.onRegisterBtnClicked();
  };

  render() {
    const { emailInput, passwordInput, passwordInput2, errorMsg } = this.state;
    const linkStyle = {
      color: 'blue',
    };
    return (
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
        </FormGroup>
        <FormGroup>
          <Label>Retype Password</Label>
          <Input
            type="password"
            placeholder="Type Password Once again"
            value={passwordInput2 || ''}
            onChange={(val) => {
              this.setInputValue('passwordInput2' as any, val.target.value);
            }}
            required
          />
          <small className="text-danger">{errorMsg}</small>
        </FormGroup>

        <Input
          className="btn-lg btn-block btn-primary"
          type="submit"
          value="Create New Account"
        />

        <div className="text-center pt-3 mb-3">
          <span
            onClick={this.toggleLoginAndRegister}
            onKeyPress={this.toggleLoginAndRegister}
            style={linkStyle}
            role="button"
          >
            I Already Have account
          </span>
        </div>
      </Form>
    );
  }
}

export default RegisterModalBody;
