import React, {
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../widgets';
import globalStyles from '../globalStyles';

export class FirstUsePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 'uninitialised', // uninitialised, initialising, initialised, error
      progressMessage: '',
      serverURL: '',
      syncSiteName: '',
      syncSitePassword: '',
    };
    this.onPressConnect = this.onPressConnect.bind(this);
    this.setProgress = this.setProgress.bind(this);
  }

  async onPressConnect() {
    try {
      await this.props.synchronizer.initialise(this.state.serverURL,
                                               this.state.syncSiteName,
                                               this.state.syncSitePassword,
                                               this.setProgress);
      this.props.onInitialised();
    } catch (error) {
      this.setProgress(error.message);
    }
  }

  setProgress(progressMessage) {
    this.setState({ progressMessage: progressMessage });
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
        <Text>{this.state.progressMessage}</Text>
      </View>
    );
  }
}

FirstUsePage.propTypes = {
  onInitialised: React.PropTypes.func.isRequired,
  synchronizer: React.PropTypes.object.isRequired,
};
