/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  StyleSheet,
  Text,
  View } from 'react-native';
import { ListView } from 'realm/react-native';


export default class TableView extends Component {
  renderLoadingView() {
    return (
      <View style={styles.container}>
        <Text> Loading items... </Text>
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
        renderRow={this.props.renderRow}
        showsVerticalScrollIndicator={true}
        scrollRenderAheadDistance={5000}
      />
    );
  }
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: '#d6f3ff',
  // },
  // name: {
  //   fontSize: 10,
  //   marginLeft: 20,
  //   marginBottom: 8,
  //   textAlign: 'left',
  // },
  // quantity: {
  //   fontSize: 20,
  //   marginRight: 20,
  //   textAlign: 'right',
  // },
  listview: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});
