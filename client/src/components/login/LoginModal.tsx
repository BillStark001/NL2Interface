/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
// import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';
// import UserStore from './UserStore';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import './LoginModal.css';
import UserStore from './UserStore';
import Utils from '../../Utils';
import LoginModalBody from './LoginModalBody';
import RegisterModalBody from './RegisterModalBody';

interface ILoginModalState {
  show: boolean;
  isLogin: boolean;
}

interface LoginModalProps {
  isLogin: boolean;
}

class LoginModal extends React.Component<LoginModalProps, ILoginModalState> {
  constructor(props: LoginModalProps) {
    super(props);
    this.state = {
      show: false,
      isLogin: props.isLogin,
    };
  }

  async componentDidMount() {
    // it seems the proxy doesn't work as planned.
    // now I use the full address to call the server.
    const userInfo = UserStore as any;
    console.log('env=', process.env.NODE_ENV);
    const route = '/api/isLoggedIn'; /// isLoggedIn
    try {
      const res = await Utils.fetch(route, {
        method: 'get',
        headers: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
      });
      const result = await res.json();
      console.log('result json', result);

      if (result && result.success) {
        userInfo.loading = false;
        userInfo.isLoggedIn = true;
        userInfo.displayName = result.username;
      } else {
        userInfo.loading = false;
        userInfo.isLoggedIn = false;
      }
    } catch (e) {
      userInfo.loading = false;
      userInfo.isLoggedIn = false;
      console.log('error=', e);
    }
  }

  toggleModalHandler = () => {
    const { show } = this.state;
    this.setState({ show: !show });
  };

  onLoginSucceed = () => {
    this.setState({ show: false });
    console.log('login successfully');
  };

  onRegisterSucceed = () => {
    this.setState({ show: false });
    console.log('register successfully');
  };

  onToggleLoginAndRegister = () => {
    const { isLogin } = this.state;
    this.setState({ isLogin: !isLogin });
    console.log('isLogin set to', !isLogin);
  };

  // eslint-disable-next-line class-methods-use-this
  async doLogout() {
    const userInfo = UserStore as any;
    try {
      const res = await fetch('/api/logout', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
      });
      const result = await res.json();

      if (result && result.success) {
        userInfo.loading = false;
        userInfo.isLoggedIn = false;
        userInfo.displayName = '';
      } else {
        console.log('error in logging out');
      }
    } catch (e) {
      console.log('error=', e);
    }
  }

  render() {
    const { show, isLogin } = this.state;
    let loginBtnText = 'Log in';
    let modalTitle = 'Please Log in';
    const userInfo = UserStore as any;
    let modalBody = (
      <LoginModalBody
        loginBtnText={loginBtnText}
        isLoading={userInfo.loading}
        onSuccess={this.onLoginSucceed}
        toggleLoginAndRegister={this.onToggleLoginAndRegister}
      />
    );
    if (userInfo.loading) {
      loginBtnText = 'Wait..';
    }
    if (!isLogin) {
      modalTitle = 'Sign Up';
      modalBody = (
        <RegisterModalBody
          onSuccess={this.onRegisterSucceed}
          toggleLoginAndRegister={this.onToggleLoginAndRegister}
        />
      );
    }
    return (
      <div>
        <Button variant="primary" onClick={this.toggleModalHandler}>
          Login
        </Button>
        <Modal
          // eslint-disable-next-line react/destructuring-assignment
          isOpen={show}
          toggle={this.toggleModalHandler}
        >
          <ModalHeader toggle={this.toggleModalHandler}>
            {modalTitle}
          </ModalHeader>

          <ModalBody>{modalBody}</ModalBody>
        </Modal>
      </div>
    );
  }
}

export default LoginModal;
