/* eslint-disable react/forbid-prop-types */
/* eslint-disable global-require */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SETTINGS_KEYS, getAppVersion } from '../../settings';

import globalStyles, { WHITE, SUSSOL_ORANGE, GREY, WARM_GREY } from '../../globalStyles';
import { Flag } from '..';
import { GenericChoiceList } from '../modalChildren/GenericChoiceList';
import { ModalContainer } from './ModalContainer';

import { LANGUAGE_NAMES, LANGUAGE_CHOICE, authStrings, navStrings } from '../../localization';
import { getModalTitle, MODAL_KEYS } from '../../utilities';
import { setCurrencyLocalisation } from '../../localization/currency';
import { setDateLocale } from '../../localization/utilities';

export class LoginModal extends React.Component {
  constructor(props) {
    super(props);
    const username = props.settings.get(SETTINGS_KEYS.MOST_RECENT_USERNAME);
    this.state = {
      authStatus: 'unauthenticated', // unauthenticated, authenticating, authenticated, error
      error: '',
      username: username || '',
      password: '',
      isLanguageModalOpen: false,
      appVersion: '',
    };
    this.setAppVersion();
    this.passwordInputRef = null;
    this.errorTimeoutId = null;
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { authStatus } = this.state;

    if (authStatus === 'authenticated' && !nextProps.isAuthenticated) {
      this.setState({
        authStatus: 'unauthenticated',
        password: '',
      });
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillUpdate() {
    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
  }

  onLogin = async () => {
    const { authenticator, onAuthentication, settings } = this.props;
    const { username, password } = this.state;

    settings.set(SETTINGS_KEYS.MOST_RECENT_USERNAME, username);

    this.setState({ authStatus: 'authenticating' });

    try {
      const user = await authenticator.authenticate(username, password);
      this.setState({ authStatus: 'authenticated' });
      onAuthentication(user);
    } catch (error) {
      const message = error.message.startsWith('Invalid username or password')
        ? authStrings.invalid_username_or_password
        : error.message;

      this.setState({ authStatus: 'error', error: message });
      onAuthentication(null);
      if (!error.message.startsWith('Invalid username or password')) {
        // After ten seconds of displaying the error, re-enable the button
        this.errorTimeoutId = setTimeout(() => {
          this.setState({ authStatus: 'unauthenticated' });
          this.errorTimeoutId = null;
        }, 10 * 1000);
      }
    }
  };

  async setAppVersion() {
    const appVersion = await getAppVersion();
    this.setState({ appVersion });
  }

  get canAttemptLogin() {
    const { authStatus, username, password } = this.state;

    return authStatus === 'unauthenticated' && username.length > 0 && password.length > 0;
  }

  get buttonText() {
    const { authStatus, error } = this.state;

    switch (authStatus) {
      case 'authenticating':
      case 'authenticated':
        return authStrings.logging_in;
      case 'error':
        return error;
      default:
        return authStrings.login;
    }
  }

  onCloseModal = () => {
    this.setState({ isLanguageModalOpen: false });
  };

  onSelectLanguage = ({ item }) => {
    const { settings } = this.props;
    settings.set(SETTINGS_KEYS.CURRENT_LANGUAGE, item.code);
    setCurrencyLocalisation(item.code);
    setDateLocale(item.code);
    this.setState({ isLanguageModalOpen: false });
  };

  renderFlag = ({ code }) => <Flag countryCode={code} />;

  render() {
    const { isAuthenticated, settings } = this.props;
    const { authStatus, username, password, appVersion, isLanguageModalOpen } = this.state;

    return (
      <ModalContainer
        isVisible={!isAuthenticated}
        style={[globalStyles.modal, globalStyles.authFormModal]}
        backdropPressToClose={false}
        swipeToClose={false}
        backgroundColor={WHITE}
      >
        <View style={[globalStyles.verticalContainer, { flex: 1 }]}>
          <View style={[globalStyles.authFormContainer]}>
            <Image
              resizeMode="contain"
              style={globalStyles.authFormLogo}
              source={require('../../images/logo_large.png')}
            />
            <View style={globalStyles.horizontalContainer}>
              <Text style={[globalStyles.authFormTextInputStyle, localStyles.syncSiteName]}>
                {settings.get(SETTINGS_KEYS.SYNC_SITE_NAME)}
              </Text>
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                style={globalStyles.authFormTextInputStyle}
                placeholder={authStrings.user_name}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={username}
                editable={authStatus !== 'authenticating'}
                returnKeyType="next"
                selectTextOnFocus
                onChangeText={text => {
                  this.setState({
                    username: text,
                    authStatus: 'unauthenticated',
                  });
                }}
                onSubmitEditing={() => {
                  if (this.passwordInputRef) this.passwordInputRef.focus();
                }}
              />
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                ref={reference => {
                  this.passwordInputRef = reference;
                }}
                style={globalStyles.authFormTextInputStyle}
                placeholder={authStrings.password}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={password}
                secureTextEntry
                editable={authStatus !== 'authenticating'}
                returnKeyType="done"
                selectTextOnFocus
                onChangeText={text => {
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
        <View style={globalStyles.bottomContainer}>
          <Icon.Button
            name="language"
            size={25}
            underlayColor="#888888"
            iconStyle={localStyles.bottomIcon}
            borderRadius={4}
            backgroundColor="rgba(255,255,255,0)"
            onPress={() => {
              this.setState({ isLanguageModalOpen: true });
            }}
          >
            <Text style={globalStyles.authWindowButtonText}>{navStrings.language}</Text>
          </Icon.Button>
          <Text style={globalStyles.authWindowButtonText}>v{appVersion}</Text>
        </View>
        <ModalContainer
          isVisible={isLanguageModalOpen}
          onClose={this.onCloseModal}
          title={getModalTitle(MODAL_KEYS.SELECT_LANGUAGE)}
        >
          <GenericChoiceList
            data={LANGUAGE_CHOICE}
            keyToDisplay="name"
            onPress={this.onSelectLanguage}
            renderLeftComponent={this.renderFlag}
            highlightValue={LANGUAGE_NAMES[settings.get(SETTINGS_KEYS.CURRENT_LANGUAGE)]}
          />
        </ModalContainer>
      </ModalContainer>
    );
  }
}

export default LoginModal;

LoginModal.propTypes = {
  authenticator: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onAuthentication: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
};

const localStyles = StyleSheet.create({
  bottomIcon: {
    color: GREY,
  },
  syncSiteName: {
    textAlign: 'center',
  },
});
