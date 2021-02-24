/* eslint-disable global-require */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-ui-components';

import { Synchroniser } from '../sync';

import { SyncState } from '../widgets';
import { getAppVersion } from '../settings';
import { DemoUserModal } from '../widgets/modals';

import globalStyles, { SUSSOL_ORANGE, WARM_GREY } from '../globalStyles';

export class FirstUsePageComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appVersion: '',
      status: 'uninitialised', // uninitialised, initialising, initialised, error.
      serverURL: '',
      syncSiteName: '',
      syncSitePassword: '',
      isDemoUserModalOpen: false,
    };
    this.setAppVersion();
    this.siteNameInputRef = null;
    this.passwordInputRef = null;
    this.onPressConnect = this.onPressConnect.bind(this);
  }

  async onPressConnect() {
    const { onInitialised, synchroniser } = this.props;
    const { serverURL, syncSiteName, syncSitePassword } = this.state;

    try {
      this.setState({ status: 'initialising' });
      await synchroniser.initialise(serverURL, syncSiteName, syncSitePassword);
      this.setState({ status: 'initialised' });

      onInitialised();
    } catch (error) {
      this.setState({ status: 'error' });
    }
  }

  async setAppVersion() {
    const appVersion = await getAppVersion();
    this.setState({ appVersion });
  }

  get canAttemptLogin() {
    const { status, serverURL, syncSiteName, syncSitePassword } = this.state;

    return (
      (status === 'uninitialised' || status === 'error') &&
      serverURL.length > 0 &&
      syncSiteName.length > 0 &&
      syncSitePassword.length > 0
    );
  }

  get buttonText() {
    const { status } = this.state;

    const { progressMessage, errorMessage, progress, total } = this.props;

    switch (status) {
      case 'initialising':
        return `${progressMessage}${total > 0 ? `\n${progress}/${total}` : ''}`;
      case 'error':
        return `${errorMessage}\nTap to retry.`;
      case 'initialised':
        return 'Success!';
      default:
        return 'Connect';
    }
  }

  onChangeServerUrl = text =>
    this.setState({
      serverURL: text,
      status: 'uninitialised',
    });

  onChangeSiteName = text =>
    this.setState({
      syncSiteName: text,
      status: 'uninitialised',
    });

  onChangePassword = text =>
    this.setState({
      syncSitePassword: text,
      status: 'uninitialised',
    });

  handleDemoModalOpen = () => this.setState({ isDemoUserModalOpen: true });

  handleDemoModalClose = () => this.setState({ isDemoUserModalOpen: false });

  render() {
    const {
      appVersion,
      isDemoUserModalOpen,
      serverURL,
      status,
      syncSiteName,
      syncSitePassword,
    } = this.state;

    return (
      <View style={[globalStyles.verticalContainer, localStyles.verticalContainer]}>
        <View style={globalStyles.authFormContainer}>
          <Image
            resizeMode="contain"
            style={globalStyles.authFormLogo}
            source={require('../images/logo_large.png')}
          />
          <View style={globalStyles.horizontalContainer}>
            <TextInput
              style={globalStyles.authFormTextInputStyle}
              placeholderTextColor={SUSSOL_ORANGE}
              underlineColorAndroid={SUSSOL_ORANGE}
              placeholder="Primary Server URL"
              value={serverURL}
              editable={status !== 'initialising'}
              returnKeyType="next"
              selectTextOnFocus
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.onChangeServerUrl}
              onSubmitEditing={() => {
                // Trim URLS. Any leading/trailing spaces lead to invalid URLs.
                this.setState({ serverURL: serverURL.trim() });

                if (this.siteNameInputRef) this.siteNameInputRef.focus();
              }}
            />
          </View>
          <View style={globalStyles.horizontalContainer}>
            <TextInput
              ref={reference => {
                this.siteNameInputRef = reference;
              }}
              style={globalStyles.authFormTextInputStyle}
              autoCompleteType="username"
              placeholderTextColor={SUSSOL_ORANGE}
              underlineColorAndroid={SUSSOL_ORANGE}
              placeholder="Sync Site Name"
              value={syncSiteName}
              editable={status !== 'initialising'}
              returnKeyType="next"
              selectTextOnFocus
              onChangeText={this.onChangeSiteName}
              onSubmitEditing={() => {
                // Trim site names. Most users don't intentionally put leading/trailing spaces in!
                this.setState({ syncSiteName: syncSiteName.trim() });

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
              autoCompleteType="password"
              placeholder="Sync Site Password"
              placeholderTextColor={SUSSOL_ORANGE}
              underlineColorAndroid={SUSSOL_ORANGE}
              value={syncSitePassword}
              secureTextEntry
              editable={status !== 'initialising'}
              returnKeyType="done"
              selectTextOnFocus
              onChangeText={this.onChangePassword}
              onSubmitEditing={() => {
                if (this.passwordInputRef) this.passwordInputRef.blur();
                if (this.canAttemptLogin) this.onPressConnect();
              }}
            />
          </View>
          <SyncState style={localStyles.initialisationStateIcon} showText={false} />
          <View style={globalStyles.authFormButtonContainer}>
            <Button
              style={globalStyles.authFormButton}
              textStyle={globalStyles.authFormButtonText}
              text={this.buttonText}
              onPress={this.onPressConnect}
              disabledColor={WARM_GREY}
              isDisabled={!this.canAttemptLogin}
            />
          </View>
        </View>
        <View style={localStyles.demoSiteRequestButtonContainer}>
          <View style={globalStyles.horizontalContainer}>
            <Button
              style={[globalStyles.authFormButton, { flex: 1 }]}
              textStyle={globalStyles.authFormButtonText}
              text="Request a Demo Store"
              onPress={this.handleDemoModalOpen}
              disabledColor={WARM_GREY}
              isDisabled={status !== 'uninitialised' && status !== 'error'}
            />
          </View>
        </View>
        <Text style={globalStyles.authWindowButtonText}> v{appVersion}</Text>
        <DemoUserModal isOpen={isDemoUserModalOpen} onClose={this.handleDemoModalClose} />
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { sync } = state;
  return sync;
};

export const FirstUsePage = connect(mapStateToProps)(FirstUsePageComponent);

FirstUsePageComponent.propTypes = {
  onInitialised: PropTypes.func.isRequired,
  synchroniser: PropTypes.instanceOf(Synchroniser).isRequired,
  progressMessage: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

const localStyles = StyleSheet.create({
  demoSiteRequestButtonContainer: {
    marginHorizontal: 300,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  initialisationStateIcon: {
    marginTop: 46,
    marginBottom: 24,
  },
  verticalContainer: {
    alignItems: 'center',
    flex: 1,
  },
});
