/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-ui-components';
import Modal from 'react-native-modalbox';
import { DemoSiteRequest } from '../../authentication';
import globalStyles, { SUSSOL_ORANGE, GREY, WARM_GREY } from '../../globalStyles';
import { authStrings, generalStrings } from '../../localization';
import { ConfirmModal } from '../../widgets';
import Icon from 'react-native-vector-icons/FontAwesome';

export class DemoUserModal extends React.Component {
  constructor(props) {
    super(props);
    this.demoSiteRequest = new DemoSiteRequest();
    this.state = {
      status: 'submit', // submit, submitting, submitted, error
      error: '',
      username: '',
      password: '',
      repeatPassword: '',
      email: '',
    };
    this.errorTimeoutId = null;
  }

  componentWillUpdate() {
    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
  }

  onDemoRequestSubmit = async () => {
    this.setState({ status: 'submitting' });
    try {
      // TODO: Demo store creation request logic goes here.
      await this.demoSiteRequest.createActivationURL(
        this.state.username,
        this.state.email,
        this.state.password,
        this.state.repeatPassword,
      );
      this.setState({ status: 'submitted' });
    } catch (error) {
      this.setState({ status: 'error', error: error.message });
      if (!error.message.startsWith('Invalid username or password')) {
        // After ten seconds of displaying the error, re-enable the button
        this.errorTimeoutId = setTimeout(() => {
          this.setState({ status: 'submit' });
          this.errorTimeoutId = null;
        }, 10 * 1000);
      }
    }
  };

  onDemoSubmittedModalClose() {
    // Reset state, close modals and go back to FirstUsePage
    this.setState({
      status: 'submit',
      username: '',
      password: '',
      repeatPassword: '',
      email: '',
    });
    this.props.onClose();
  }

  get canAttemptSubmit() {
    return (
      this.state.status === 'submit' &&
      this.state.username.length > 0 &&
      this.state.password.length > 0 &&
      this.state.email.length > 0 &&
      this.state.repeatPassword.length > 0
    );
  }

  get buttonText() {
    switch (this.state.status) {
      case 'submitting':
        return generalStrings.submitting;
      case 'submitted':
        return generalStrings.submitted;
      case 'error':
        return this.state.error;
      default:
        return generalStrings.submit;
    }
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        style={[globalStyles.modal, globalStyles.authFormModal]}
        backdropPressToClose={false}
        swipeToClose={true}
      >
        <View style={[globalStyles.verticalContainer, { flex: 1 }]}>
          <View style={[globalStyles.authFormContainer]}>
            <View style={localStyles.closeButtonContainer}>
              <TouchableOpacity onPress={this.props.onClose} style={localStyles.closeButton}>
                <Icon name="close" style={localStyles.closeIcon} />
              </TouchableOpacity>
            </View>
            <Image
              resizeMode="contain"
              style={globalStyles.authFormLogo}
              source={require('../../images/logo_large.png')}
            />
            <View style={globalStyles.horizontalContainer}>
              <Text style={[globalStyles.authFormTextInputStyle, localStyles.syncSiteName]}>
                Please provide your User Name, Email address & Password below
              </Text>
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                style={globalStyles.authFormTextInputStyle}
                placeholder={authStrings.user_name}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={this.state.username}
                editable={this.state.status !== 'submitting'}
                returnKeyType={'next'}
                selectTextOnFocus
                onChangeText={text => {
                  this.setState({ username: text, status: 'submit' });
                }}
              />
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                style={globalStyles.authFormTextInputStyle}
                placeholder={authStrings.email}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                selectTextOnFocus
                value={this.state.email}
                editable={this.state.status !== 'submitting'}
                returnKeyType={'next'}
                selectTextOnFocus
                onChangeText={text => {
                  this.setState({ email: text, status: 'submit' });
                }}
              />
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                style={globalStyles.authFormTextInputStyle}
                placeholder={authStrings.password}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={this.state.password}
                secureTextEntry
                editable={this.state.status !== 'submitting'}
                returnKeyType={'next'}
                selectTextOnFocus
                onChangeText={text => {
                  this.setState({ password: text, status: 'submit' });
                }}
              />
            </View>
            <View style={globalStyles.horizontalContainer}>
              <TextInput
                style={globalStyles.authFormTextInputStyle}
                placeholder={authStrings.repeat_password}
                placeholderTextColor={SUSSOL_ORANGE}
                underlineColorAndroid={SUSSOL_ORANGE}
                value={this.state.repeatPassword}
                secureTextEntry
                editable={this.state.status !== 'submitting'}
                returnKeyType={'next'}
                selectTextOnFocus
                onChangeText={text => {
                  this.setState({ repeatPassword: text, status: 'submit' });
                }}
                onSubmitEditing={() => {
                  if (this.canAttemptSubmit) this.onDemoRequestSubmit();
                }}
              />
            </View>
            <View style={globalStyles.authFormButtonContainer}>
              <Button
                style={[globalStyles.authFormButton, globalStyles.loginButton]}
                textStyle={globalStyles.authFormButtonText}
                text={this.buttonText}
                onPress={this.onDemoRequestSubmit}
                disabledColor={WARM_GREY}
                isDisabled={!this.canAttemptSubmit}
              />
            </View>
          </View>
          <ConfirmModal
            isOpen={this.state.status === 'submitted'}
            questionText="One step closer to creating your Demo Store. We need to verify
            the email address you have provided so that we could generate your store and
            send you the credentials to it. We have sent you an e-mail with a verification
            link. Please check your provided email address and click on the verification link."
            onConfirm={() => this.onDemoSubmittedModalClose()}
            confirmText="Close"
          />
        </View>
      </Modal>
    );
  }
}

DemoUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

DemoUserModal.defaultProps = {
  style: {},
  textStyle: {},
};

const localStyles = StyleSheet.create({
  bottomIcon: {
    color: GREY,
  },
  syncSiteName: {
    textAlign: 'center',
    color: GREY,
    marginBottom: 20,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 15,
    right: 0,
  },
  closeButton: {
    width: 50,
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: GREY,
  },
});
