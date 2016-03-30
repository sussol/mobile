import React, {
  Component,
  StyleSheet,
  Text,
  View } from 'react-native';
import { ListView } from 'realm/react-native';

import realm from '../schema/Realm'
import realmMock from '../schema/mockDBInstantiator'

if (realm.objects('Item').length === 0) {
  realmMock();
}

export default class TableView extends Component {
  render() {
    let drugs = realm.objects('Item');
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Show something: {drugs[1].lines[0].id}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
