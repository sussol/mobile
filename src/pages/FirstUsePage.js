import React, {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../widgets';

export default class FirstUsePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 'uninitialised', // uninitialised, initialising, initialised, error
      error: '',
      serverURL: '',
      syncSiteName: '',
      syncSitePassword: '',
    };
  }

  componentWillMount() {
    this.onPressConnect = this.onPressConnect.bind(this);
  }

  onPressConnect() {
    this.props.synchronizer.initialise(this.state.serverURL,
                                       this.state.syncSiteName,
                                       this.state.syncSitePassword,
                                       (error) => this.setState({ error: error }))
      .then(this.props.onInitialised,
      (error) => {
        this.setState({ error: error });
      }
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="Primary Server URL"
          value={this.state.serverURL}
          onChangeText={ (text) => { this.setState({ serverURL: text }); }}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Sync Site Name"
          value={this.state.syncSiteName}
          onChangeText={ (text) => { this.setState({ syncSiteName: text }); }}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Sync Site Password"
          value={this.state.syncSitePassword}
          secureTextEntry
          onChangeText={ (text) => { this.setState({ syncSitePassword: text }); }}
        />
        <Button
          text="Connect to mSupply"
          onPress={this.onPressConnect}
        />
        <Text>{this.state.error}</Text>
      </View>
    );
  }
}

FirstUsePage.propTypes = {
  onInitialised: React.PropTypes.func.isRequired,
  synchronizer: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    fontFamily: 'Comic Sans',
  },
});
