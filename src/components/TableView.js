import React, {
  Component,
  StyleSheet,
  Text,
  View } from 'react-native';
import { ListView } from 'realm/react-native';

import realm from '../schema/Realm'
import realmMock from '../schema/mockDBInstantiator'

export default class TableView extends Component {
  render() {

    realmMock();

    let drugs = realm.objects('Item');
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          name of drug in Realm: {drug[0].name}
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
