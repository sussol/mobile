/* @flow weak */

/**
 * OfflineMobile Android ConfirmModal
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../Button';
import Modal from 'react-native-modalbox';

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

  onLogin() {
    this.setState({ authStatus: 'authenticating' });
    this.props.authenticator.authenticate(this.state.username, this.state.password)
      .then(() => {
        this.setState({ authStatus: 'authenticated' });
        this.props.onAuthentication(true);
      }, (error) => {
        this.setState({ authStatus: 'error', error: error });
        this.props.onAuthentication(false);
      });
  }

  render() {
    return (
      <Modal
        isOpen={!this.props.isAuthenticated}
        style={[localStyles.modal, this.props.style]}
        backdropPressToClose={false}
        swipeToClose={false}
        startOpen
      >
        <View style={[localStyles.container, this.props.style.container]}>
          <TextInput
            style={this.props.textStyle}
            placeholder="Username"
            value={this.state.username}
            onChangeText={ (text) => { this.setState({ username: text }); }}
          />
          <TextInput
            style={this.props.textStyle}
            placeholder="Password"
            value={this.state.password}
            secureTextEntry
            onChangeText={ (text) => { this.setState({ password: text }); }}
          />
          <Button
            style={this.props.textStyle}
            text="Log In"
            onPress={this.onLogin}
          />
          <Text>{this.state.authStatus}</Text>
          <Text>{this.state.error}</Text>
        </View>
      </Modal>
    );
  }
}

LoginModal.propTypes = {
  authenticator: React.PropTypes.object.isRequired,
  isAuthenticated: React.PropTypes.bool.isRequired,
  onAuthentication: React.PropTypes.func.isRequired,
  style: React.View.propTypes.style,
  textStyle: React.Text.propTypes.style,
};
LoginModal.defaultProps = {
  style: {},
  textStyle: {},
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    height: Dimensions.get('window').height,
    flex: 1,
  },
});
