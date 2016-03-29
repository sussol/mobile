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

    realmMock.instantiate();

    let drugs = realm.objects('Item');
    let oneDrug = drugs.slice(5,6);
    let text = "name of drug in Realm:";
    oneDrug.forEach((drug,i,collection)=>{
      text = text + drug.code;
    });
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          name of drug in Realm: {oneDrug[0].name}
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
