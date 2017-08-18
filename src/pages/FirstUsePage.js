/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from 'react-native-ui-components';
import { SyncState } from '../widgets';
import globalStyles, {
  SUSSOL_ORANGE,
  WARM_GREY,
} from '../globalStyles';
import { getAppVersion } from '../settings';

export class FirstUsePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appVersion: '',
      status: 'uninitialised', // uninitialised, initialising, initialised, error
      serverURL: '',
      syncSiteName: '',
      syncSitePassword: '',
    };
    this.setAppVersion();
    this.siteNameInputRef = null;
    this.passwordInputRef = null;
    this.onPressConnect = this.onPressConnect.bind(this);
  }

  async onPressConnect() {
    try {
      this.setState({ status: 'initialising' });
      await this.props.synchroniser.initialise(
        this.state.serverURL,
        this.state.syncSiteName,
        this.state.syncSitePassword);
      this.setState({ status: 'initialised' });
      this.props.onInitialised();
    } catch (error) {
      this.setState({ status: 'error' });
    }
  }

  async setAppVersion() {
    const appVersion = await getAppVersion();
    this.setState({ appVersion: appVersion });
  }

  get canAttemptLogin() {
    return (
      (this.state.status === 'uninitialised' || this.state.status === 'error') &&
      this.state.serverURL.length > 0 &&
      this.state.syncSiteName.length > 0 &&
      this.state.syncSitePassword.length > 0
    );
  }

  get buttonText() {
    const { progressMessage, errorMessage, progress, total } = this.props.syncState;
    switch (this.state.status) {
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

  render() {
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
              value={this.state.serverURL}
              editable={this.state.status !== 'initialising'}
              returnKeyType={'next'}
              selectTextOnFocus
              onChangeText={(text) => {
                this.setState({ serverURL: text, status: 'uninitialised' });
              }}
              onSubmitEditing={() => {
                if (this.siteNameInputRef) this.siteNameInputRef.focus();
              }}
            />
          </View>
          <View style={globalStyles.horizontalContainer}>
            <TextInput
              ref={(reference) => (this.siteNameInputRef = reference)}
              style={globalStyles.authFormTextInputStyle}
              placeholderTextColor={SUSSOL_ORANGE}
              underlineColorAndroid={SUSSOL_ORANGE}
              placeholder="Sync Site Name"
              value={this.state.syncSiteName}
              editable={this.state.status !== 'initialising'}
              returnKeyType={'next'}
              selectTextOnFocus
              onChangeText={(text) => {
                this.setState({ syncSiteName: text, status: 'uninitialised' });
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
              placeholder="Sync Site Password"
              placeholderTextColor={SUSSOL_ORANGE}
              underlineColorAndroid={SUSSOL_ORANGE}
              value={this.state.syncSitePassword}
              secureTextEntry
              editable={this.state.status !== 'initialising'}
              returnKeyType={'done'}
              selectTextOnFocus
              onChangeText={(text) => {
                this.setState({ syncSitePassword: text, status: 'uninitialised' });
              }}
              onSubmitEditing={() => {
                if (this.passwordInputRef) this.passwordInputRef.blur();
                if (this.canAttemptLogin) this.onPressConnect();
              }}
            />
          </View>
          <SyncState
            style={localStyles.initialisationStateIcon}
            state={this.props.syncState}
            showText={false}
          />
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
        <Text style={globalStyles.authWindowButtonText}> v{this.state.appVersion}</Text>
      </View>
    );
  }
}

FirstUsePage.propTypes = {
  onInitialised: PropTypes.func.isRequired,
  synchroniser: PropTypes.object.isRequired,
  syncState: PropTypes.object.isRequired,
};

const localStyles = StyleSheet.create({
  initialisationStateIcon: {
    marginTop: 46,
    marginBottom: 24,
  },
  verticalContainer: {
    alignItems: 'center',
    flex: 1,
  },
});
