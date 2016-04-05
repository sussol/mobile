/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  Component,
  StyleSheet,
  View
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

  renderRow(item) {
    return(
      <View>
        <View style={styles.rowSeparator} />
        <View style={styles.container} onClick={this.handleClick}>
          <View style={styles.codeField}>
            <Text style={styles.text}>{item.code}</Text>
          </View>
          <View style={styles.fieldSeparator} />
          <View style={styles.nameField}>
            <Text style={styles.text}>{item.name}</Text>
          </View>
          <View style={styles.fieldSeparator} />
          <View style={styles.valueField}>
            <Text style={styles.value}>{item.defaultPackSize}</Text>
          </View>
        </View>
      </View>
    );
  }

  render() {
    return(
      <View style={styles.verticalContainer} >
        {/*<View style={styles.rowSeparator} />*/}
        <ListView
          dataSource={this.state.dataSource}
          loaded={this.state.loaded}
          renderRow={this.renderRow}
          showsVerticalScrollIndicator={true}
          scrollRenderAheadDistance={5000}
        />
      </View>
    );
  }
}

let styles = StyleSheet.create({
  verticalContainer: {
    flex: 1,
  },
  rowSeparator: {
    // flex: 0,
    height: 2,
    backgroundColor: '#98d7f1',
  },
  fieldSeparator: {
    // flex: 1,
    alignSelf: 'flex-start',
    height: 35,
    width: 2,
    backgroundColor: '#98d7f1',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#d6f3ff',
  },
  codeField: {
    flex: 1,
  },
  nameField: {
    flex: 3,
  },
  valueField: {
    flex: 1,
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
