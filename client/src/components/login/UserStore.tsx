/* eslint-disable import/no-extraneous-dependencies */
import { extendObservable } from 'mobx';

class UserStore {
  constructor() {
    extendObservable(this, {
      loading: true,
      isLoggedIn: false,
      displayName: '',
      email: '',
      id: '',
    });
  }
}

export default new UserStore();
