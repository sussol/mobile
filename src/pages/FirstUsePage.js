import React, {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../widgets';

export default class FirstUsePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverURL: '',
      syncSiteName: '',
      syncSitePassword: '',
    };
  }

  render() {
    return (
      <View style={styles.container}>
          <TextInput
            placeholder="Primary Server URL"
            value={this.state.serverURL}
            onChangeText={ (text) => { this.setState({ serverURL: text }); }}
          />
          <TextInput
            placeholder="Sync Site Name"
            value={this.state.syncSiteName}
            onChangeText={ (text) => { this.setState({ syncSiteName: text }); }}
          />
        <TextInput
          placeholder="Sync Site Password"
          value={this.state.syncSitePassword}
          onChangeText={ (text) => { this.setState({ syncSitePassword: text }); }}
        />
        <Button
          text="Connect to mSupply"
          onPress={() => {
            this.props.database.write(() => {
              this.props.database.create('Setting', {
                key: 'ServerURL',
                value: this.state.serverURL,
              }, true);
              this.props.database.create('Setting', {
                key: 'SyncSiteName',
                value: this.state.syncSiteName,
              }, true);
              this.props.database.create('Setting', {
                key: 'SyncSitePassword',
                value: this.state.syncSitePassword,
              }, true);
            });
            this.props.navigateTo('login', 'Log In');
          }}
        />
      </View>
    );
  }
}

FirstUsePage.propTypes = {
  database: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
