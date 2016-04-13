/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  TextInput,
  Component,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import TableView, {
  Row,
  Cell,
  RowView,
  EditableCell,
  Expansion,
  ExpansionView,
  TableButton,
  Header,
  HeaderCell,
} from './TableView';

import realm from '../schema/Realm';
import { ListView } from 'realm/react-native';

export class Catalogue extends Component {

  constructor(props) {
    super(props);
    let dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    });
    let data = realm.objects('Item').sorted('name')
    let ids = data.map(item => item.code)
    this.state = {
      query:'item_name=@',
      id: (item) => item.id,
      dataSource: dataSource.cloneWithRows(dataSource, ids),
      items: realm.objects('Item').sorted('name'),
      sortBy: 'name',
      reverseSort: false,
      loaded: false,
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
      dataSource: this.state.dataSource.cloneWithRows(
        this.state.items.filtered('name CONTAINS[c] $0', itemName).sorted(this.state.sortBy))
    });
  }

  nameSort(){
    console.log("Sort direction on name column pressed " + this.state.reverseSort);
    // TODO: Below is terrible and needs to have a better implementation.
    // Trying to trigger rerender.
    this.setState({
      reverseSort: this.state.reverseSort ? false : true,
      DataSource: this.state.dataSource.cloneWithRows(
        this.state.items.sorted(this.state.sortBy, this.state.reverseSort))
      });
  }

  header() {
    return (
      <Header>
        <HeaderCell style={styles.text} width={1}>Item Code</HeaderCell>
        <HeaderCell style={styles.text} width={5} onPress={() => this.nameSort()}>Item Name</HeaderCell>
        <HeaderCell style={styles.packSize} width={2}>Default Pack Size</HeaderCell>
      </Header>
    );
  }

  getItemDepartmentName(item) {
    let code = item.code;
    // console.log("item:      " + item)
    // console.log("code:      " + code)
    // console.log("typeofCode:   " + typeof code)
    if (code) {
      // console.log("code True: true")
      return item.department.name
    }
    // console.log("code True: false");
    return "Undefined"
  }

  deleteButton(item) {
    //TODO: needs a modal dialog, deleting needs confirmation!!
    console.log("Pressed deleteButton for item: " + item.name);
    realm.write(() => {
      realm.delete(item)
    })

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.state.items)
    });
  }

  onEndEditing(item, value) {
      realm.write(() => {
        console.log('In edit write for : '+ item.name);
        item.defaultPackSize = parseFloat(value)
      })
  }

  expansion(item) {
    return(
      <Expansion>
        <ExpansionView>
          <Text style={styles.text}>Department: {this.getItemDepartmentName(item)}</Text>
          <Text style={styles.text}>Description: {item.description}</Text>
        </ExpansionView>
        <TableButton onPress={() => this.deleteButton(item)}>
          <Text style={styles.text} >Delete Item</Text>
        </TableButton>
      </Expansion>
    )
  }

  renderRow(item) {
    console.log("Row of rendered for: " + item.code)
    return (
      <Row expansion={() => this.expansion(item)}>
        <RowView>
          <Cell style={styles.text} width={1}>{item.code}</Cell>
          <Cell style={styles.text} width={5}>{item.name}</Cell>
          <EditableCell style={styles.packSize} width={2} onEndEditing={this.onEndEditing} item={item}>
            {item.defaultPackSize}
          </EditableCell>
        </RowView>
      </Row>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Text Component outside of TableView</Text>
        <TableView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          header={this.header.bind(this)}
          searchBar={this.onSearchChange.bind(this)}
        />
      </View>
    );
  };
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: 'rgba(130, 171, 189, 0.7)',
  },
  text: {
    fontSize: 20,
    marginLeft: 20,
    textAlign: 'left',
  },
  packSize: {
    fontSize: 20,
    height: 45,
    textAlign: 'right',
    marginRight: 20,
  },
  TableView: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});
