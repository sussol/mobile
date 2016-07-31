/* @flow weak */

/**
 * mSupply Mobile
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
import { SETTINGS_KEYS } from '../../settings';

export class LoginModal extends React.Component {
  constructor(props) {
    super(props);
    const username = props.settings.get(SETTINGS_KEYS.MOST_RECENT_USERNAME);
    this.state = {
      authStatus: 'unauthenticated', // unauthenticated, authenticating, authenticated, error
      error: '',
      username: username || '',
      password: '',
    };
    this.passwordInputRef = null;
    this.errorTimeoutId = null;
  }

  componentWillMount() {
    this.onLogin = this.onLogin.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.authStatus === 'authenticated' && !nextProps.isAuthenticated) {
      this.setState({
        authStatus: 'unauthenticated',
        password: '',
      });
    }
  }

  componentWillUpdate() {
    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
  }

  async onLogin() {
    this.props.settings.set(SETTINGS_KEYS.MOST_RECENT_USERNAME, this.state.username);
    this.setState({ authStatus: 'authenticating' });
    try {
      const user = await this.props.authenticator.authenticate(this.state.username,
                                                               this.state.password);
      this.setState({ authStatus: 'authenticated' });
      this.props.onAuthentication(user);
    } catch (error) {
      this.setState({ authStatus: 'error', error: error.message });
      this.props.onAuthentication(null);
      if (!error.message.startsWith('Invalid username or password')) {
        // After ten seconds of displaying the error, re-enable the button
        this.errorTimeoutId = setTimeout(() => {
          this.setState({ authStatus: 'unauthenticated' });
          this.errorTimeoutId = null;
        }, 10 * 1000);
      }
    }
  }

  get canAttemptLogin() {
    return (
      this.state.authStatus === 'unauthenticated' &&
      this.state.username.length > 0 &&
      this.state.password.length > 0
    );
  }

  get buttonText() {
    switch (this.state.authStatus) {
      case 'authenticating':
      case 'authenticated':
        return 'Logging in...';
      case 'error':
        return this.state.error;
      default:
        return 'Login';
    }
  }

  render() {
    return (
      <Modal
        isOpen={!this.props.isAuthenticated}
        style={[globalStyles.modal, globalStyles.authFormModal]}
        backdropPressToClose={false}
        backdropOpacity={1}
        swipeToClose={false}
        position="top"
        startOpen
      >
        <View style={globalStyles.horizontalContainer}>
          <View style={[globalStyles.authFormContainer]}>
            <Image
              resizeMode="contain"
              style={globalStyles.authFormLogo}
              source={require('../../images/logo_large.png')}
            />
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                style={globalStyles.authFormTextInputStyle}
                placeholder="User Name"
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={this.state.username}
                editable={this.state.authStatus !== 'authenticating'}
                returnKeyType={'next'}
                selectTextOnFocus
                onChangeText={(text) => {
                  this.setState({ username: text, authStatus: 'unauthenticated' });
                }}
                onSubmitEditing={() => {
                  if (this.passwordInputRef) this.passwordInputRef.focus();
                }}
              />
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                ref={(reference) => (this.passwordInputRef = reference)}
                style={globalStyles.authFormTextInputStyle}
                placeholder="Password"
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={this.state.password}
                secureTextEntry
                editable={this.state.authStatus !== 'authenticating'}
                returnKeyType={'done'}
                selectTextOnFocus
                onChangeText={(text) => {
                  this.setState({ password: text, authStatus: 'unauthenticated' });
                }}
                onSubmitEditing={() => {
                  if (this.passwordInputRef) this.passwordInputRef.blur();
                  if (this.canAttemptLogin) this.onLogin();
                }}
              />
            </View>
            <View style={globalStyles.authFormButtonContainer}>
              <Button
                style={[globalStyles.authFormButton, globalStyles.loginButton]}
                textStyle={globalStyles.authFormButtonText}
                text={this.buttonText}
                onPress={this.onLogin}
                disabledColor={WARM_GREY}
                isDisabled={!this.canAttemptLogin}
              />
            </View>
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
  settings: React.PropTypes.object.isRequired,
};
LoginModal.defaultProps = {
  style: {},
  textStyle: {},
};
