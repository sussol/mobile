/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Image,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../Button';
import Modal from 'react-native-modalbox';
import globalStyles, {
  SUSSOL_ORANGE,
  WARM_GREY,
} from '../../globalStyles';

export class LoginModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authStatus: 'unauthenticated', // unauthenticated, authenticating, authenticated, error
      error: '',
      username: '',
      password: '',
    };
  }

  componentWillMount() {
    this.onLogin = this.onLogin.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isAuthenticated) this.setState({ authStatus: 'unauthenticated' });
  }

  async onLogin() {
    this.setState({ authStatus: 'authenticating' });
    try {
      const user = await this.props.authenticator.authenticate(this.state.username,
                                                               this.state.password);
      this.setState({ authStatus: 'authenticated' });
      this.props.onAuthentication(user);
    } catch (error) {
      this.setState({ authStatus: 'error', error: error.message });
      this.props.onAuthentication(null);
    }
  }

  getButtonDisabled() {
    return (
      this.state.authStatus !== 'unauthenticated' ||
      this.state.username.length === 0 ||
      this.state.password.length === 0
    );
  }

  getButtonText() {
    switch (this.state.authStatus) {
      case 'authenticating':
      case 'authenticated':
        return 'Logging in...';
      case 'error':
        return 'Login failed.';
      default:
        return 'Login';
    }
  }

  render() {
    return (
      <Modal
        isOpen={!this.props.isAuthenticated}
        style={[globalStyles.modal, globalStyles.loginModal]}
        backdropPressToClose={false}
        backdropOpacity={1}
        swipeToClose={false}
        position="top"
        startOpen
      >
        <View style={[globalStyles.loginContainer]}>
          <Image
            resizeMode="contain"
            style={globalStyles.loginLogo}
            source={require('../../images/logo_large.png')}
          />
          <TextInput
            style={globalStyles.loginTextInputStyle}
            placeholder="User Name"
            placeholderTextColor={SUSSOL_ORANGE}
            underlineColorAndroid={SUSSOL_ORANGE}
            value={this.state.username}
            editable={this.state.authStatus !== 'authenticating'}
            onChangeText={ (text) => {
              this.setState({ username: text, authStatus: 'unauthenticated' });
            }}
          />
          <TextInput
            style={globalStyles.loginTextInputStyle}
            placeholder="Password"
            placeholderTextColor={SUSSOL_ORANGE}
            underlineColorAndroid={SUSSOL_ORANGE}
            value={this.state.password}
            secureTextEntry
            editable={this.state.authStatus !== 'authenticating'}
            onChangeText={ (text) => {
              this.setState({ password: text, authStatus: 'unauthenticated' });
            }}
          />
          <View style={globalStyles.loginButtonContainer}>
            <Button
              style={globalStyles.loginButton}
              textStyle={globalStyles.loginButtonText}
              text={this.getButtonText()}
              onPress={this.onLogin}
              disabledColor={WARM_GREY}
              disabled={this.getButtonDisabled()}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

LoginModal.propTypes = {
  authenticator: React.PropTypes.object.isRequired,
  isAuthenticated: React.PropTypes.bool.isRequired,
  onAuthentication: React.PropTypes.func.isRequired,
};
LoginModal.defaultProps = {
  style: {},
  textStyle: {},
};
