import React, {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { UserAuthenticator } from '../authentication';
import { Button } from '../widgets';

export default class LoginPage extends React.Component {

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
    this.authenticator = new UserAuthenticator(this.props.database);
  }

  onLogin() {
    this.setState({ authStatus: 'authenticating' });
    this.authenticator.authenticate(
      this.state.username,
      this.state.password,
      () => { // On success
        this.setState({ authStatus: 'authenticated' });
        this.props.navigateTo('menu', 'Menu');
      },
      (error) => { // On failure
        this.setState({ authStatus: 'error', error });
      }
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          placeholder="Username"
          value={this.state.username}
          onChangeText={ (text) => { this.setState({ username: text }); }}
        />
        <TextInput
          placeholder="Password"
          value={this.state.password}
          onChangeText={ (text) => { this.setState({ password: text }); }}
        />
        <Button
          text="Log In"
          onPress={this.onLogin}
        />
        <Text>{this.state.authStatus}</Text>
        <Text>{this.state.error}</Text>
      </View>
    );
  }
}

LoginPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  database: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
