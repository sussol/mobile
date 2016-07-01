jest.unmock('../LoginModal');
jest.unmock('enzyme');
jest.unmock('sinon');
jest.unmock('promise-sync-es6');

import { LoginModal } from '../LoginModal';
import Promise from 'promise-sync-es6';
import React from 'react';
import { TextInput } from 'react-native';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { Button } from '../../Button';

const VALID_USERNAME = 'valid';
const VALID_PASSWORD = 'valid';
const INVALID_PASSWORD = 'invalid';
const ERROR_MESSAGE = 'Authentication failed';

class MockAuthenticator {
  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      if (username === VALID_USERNAME && password === VALID_PASSWORD) resolve();
      else reject(ERROR_MESSAGE);
    });
  }
}

describe('LoginModal', () => {
  let authenticator;
  let onAuthentication;
  let wrapper;

  beforeEach(() => {
    authenticator = new MockAuthenticator();
    onAuthentication = sinon.spy();
    wrapper = shallow(
      <LoginModal
        authenticator={authenticator}
        isAuthenticated={false}
        onAuthentication={ onAuthentication }
      />
    );
  });

  it('triggers onAuthentication when login pressed', () => {
    expect(onAuthentication.calledOnce).toBe(false);
    wrapper.find(TextInput).at(0).simulate('changeText', VALID_USERNAME);
    wrapper.find(TextInput).at(1).simulate('changeText', VALID_PASSWORD);
    wrapper.find(Button).first().simulate('press');
    expect(onAuthentication.calledOnce).toBe(true);
  });

  it('calls onAuthentication with true when username and password valid', () => {
    expect(onAuthentication.calledOnce).toBe(false);
    wrapper.find(TextInput).at(0).simulate('changeText', VALID_USERNAME);
    wrapper.find(TextInput).at(1).simulate('changeText', VALID_PASSWORD);
    wrapper.find(Button).first().simulate('press');
    expect(onAuthentication.calledOnce).toBe(true);
    expect(onAuthentication.calledWith(true)).toBe(true);
  });

  it('calls onAuthentication with false when password invalid', () => {
    expect(onAuthentication.calledOnce).toBe(false);
    wrapper.find(TextInput).at(0).simulate('changeText', VALID_USERNAME);
    wrapper.find(TextInput).at(1).simulate('changeText', INVALID_PASSWORD);
    wrapper.find(Button).first().simulate('press');
    expect(onAuthentication.calledOnce).toBe(true);
    expect(onAuthentication.calledWith(false)).toBe(true);
  });

  it('displays an error when authentication fails', () => {
    expect(wrapper.contains(ERROR_MESSAGE)).toBe(false);
    wrapper.find(TextInput).at(0).simulate('changeText', VALID_USERNAME);
    wrapper.find(TextInput).at(1).simulate('changeText', INVALID_PASSWORD);
    wrapper.find(Button).first().simulate('press');
    expect(wrapper.contains(ERROR_MESSAGE)).toBe(true);
  });

  it('does not display an error when authentication succeeds', () => {
    expect(wrapper.contains(ERROR_MESSAGE)).toBe(false);
    wrapper.find(TextInput).at(0).simulate('changeText', VALID_USERNAME);
    wrapper.find(TextInput).at(1).simulate('changeText', VALID_PASSWORD);
    wrapper.find(Button).first().simulate('press');
    expect(wrapper.contains(ERROR_MESSAGE)).toBe(false);
  });
});
