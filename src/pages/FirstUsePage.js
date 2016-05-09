import React, {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../widgets';
import { authenticationUtils } from '../authentication';
const {
  hashPassword,
} = authenticationUtils;

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
          onPress={() => {
            const passwordHash = hashPassword(this.state.syncSitePassword);
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
                key: 'SyncSitePasswordHash',
                value: passwordHash,
              }, true);
            });
            this.props.onInitialised();
          }}
        />
      </View>
    );
  }
}

FirstUsePage.propTypes = {
  database: React.PropTypes.object.isRequired,
  onInitialised: React.PropTypes.func.isRequired,
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
