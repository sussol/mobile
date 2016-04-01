import React, {
  Component,
  StyleSheet,
  View
} from 'react-native';

import ItemList from './TableView';
import realm from '../schema/Realm';
import {ListView} from 'realm/react-native';

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

  render() {
    return(
      <View style={styles.verticalContainer} >
        <View style={styles.separator} />
        <ItemList
          dataSource={this.state.dataSource}
          loaded={this.state.loaded} />
      </View>
    );
  }
}

let styles = StyleSheet.create({
  verticalContainer: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  }
});
