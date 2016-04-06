/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  Component,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity
} from 'react-native';

import TableView from './TableView';
import realm from '../schema/Realm';
import { ListView } from 'realm/react-native';

export class Catalogue extends Component {

  constructor(props) {
    super(props);
    let dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      query:'item_name=@',
      dataSource: dataSource.cloneWithRows(dataSource),
      items: realm.objects('Item').sorted('name'),
      loaded:false,
    };
    this.onSearchChange = this.onSearchChange.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.state.items),
      loaded: true,
    });
  }

  onSearchChange(event: Object) {
    let itemName = event.nativeEvent.text;
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.state.items.filtered('name BEGINSWITH $0', itemName))
    });
  }

  // Field functions

  itemCode(item) {
    return (
      <Text style={styles.text}>
        {item.code}
      </Text>
    );
  }

  itemName(item) {
    return (
      <Text style={styles.text}>
        {item.name}
      </Text>
    );
  }

  itemDefaultPackSize(item) {
    return (
      <Text style={styles.value}>
        {item.defaultPackSize}
      </Text>
    );
  }

  button() {
    return (
      <TouchableHighlight onPress={()=>{}} underlayColor="white">
        <View style={styles.button}>
          <Text style={styles.text}>
            Holy button
          </Text>
        </View>
      </TouchableHighlight>
    );
  }

/**
* rowFields is an array of functions defined above. Each Function
* defines a component in the row.
*
* rowStyles is an array of inline css corresponding to each component
* in the rowFields array, largly for defining flex values.
*
*/
  render() {
    return(
      <TableView
        dataSource={this.state.dataSource}
        rowFields={[this.button.bind(this), this.itemCode, this.itemName, this.itemDefaultPackSize]}
        rowStyles={[{flex:1}, {flex: 1}, {flex: 3}, {flex: 1}]}
        showsVerticalScrollIndicator={true}
        scrollRenderAheadDistance={5000}
      />
    );
  };
}



let styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(130, 171, 189, 0.7)',
  },
  text: {
    fontSize: 20,
    marginLeft: 20,
    marginBottom: 8,
    textAlign: 'left',
  },
  value: {
    fontSize: 20,
    marginRight: 20,
    marginBottom: 8,
    textAlign: 'right',
  },
  listview: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});
