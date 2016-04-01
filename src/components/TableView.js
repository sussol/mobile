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
  renderLoadingView() {
    return (
      <View style={styles.container}>
        <Text> Loading items... </Text>
      </View>
    );
  }

  renderItem(item) {
    return (
      <View style={styles.container} onClick={this.handleClick}>
        <Text style={[styles.itemText, styles.name]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.itemText, styles.quantity]} numberOfLines={1}>{item.defaultPackSize}</Text>
      </View>
    );
  }

  render() {
    if(!this.props.loaded) {
      return this.renderLoadingView();
    }

    return(
      <ListView
        style={styles.listview}
        dataSource={this.props.dataSource}
        renderRow={this.renderItem}
        initialListSize={200}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  name: {
    flex: 3,
    fontSize: 20,
    marginLeft: 20,
    marginBottom: 8,
    textAlign: 'left',
  },
  quantity: {
    flex: 1,
    fontSize: 20,
    marginRight: 20,
    textAlign: 'right',
  },
  listview: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});
