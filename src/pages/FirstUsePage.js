import React, {
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../widgets';
import globalStyles from '../globalStyles';

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
      <View style={[globalStyles.container, globalStyles.modal]}>
        <TextInput
          style={globalStyles.textInput}
          placeholder="Primary Server URL"
          value={this.state.serverURL}
          onChangeText={ (text) => { this.setState({ serverURL: text }); }}
        />
        <TextInput
          style={globalStyles.textInput}
          placeholder="Sync Site Name"
          value={this.state.syncSiteName}
          onChangeText={ (text) => { this.setState({ syncSiteName: text }); }}
        />
        <TextInput
          style={globalStyles.textInput}
          placeholder="Sync Site Password"
          value={this.state.syncSitePassword}
          secureTextEntry
          onChangeText={ (text) => { this.setState({ syncSitePassword: text }); }}
        />
        <Button
          style={globalStyles.button}
          textStyle={globalStyles.buttonText}
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
