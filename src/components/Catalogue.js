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

const styles = StyleSheet.create({
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

export class Catalogue extends Component {

  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource,
      query: 'item_name=@',
      items: realm.objects('Item'),
      sortBy: 'name',
      reverseSort: false,
      loaded: false,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.nameSort = this.nameSort.bind(this);
    this.getHeader = this.getHeader.bind(this);
    this.deleteButton = this.deleteButton.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.expansion = this.expansion.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    // console.log("componentWillMount was called")
    const data = this.state.items.sorted(this.state.sortBy);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
      loaded: true,
    });
  }


  onSearchChange(event) {
    const term = event.nativeEvent.text;
    const { items, sortBy, dataSource } = this.state;
    // console.log(`term sortBy: ${typeof items} ++++++++++++++++++++++++++++++++++++++`);
    const data = items.filtered(`${sortBy} CONTAINS[c] $0`, term).sorted(sortBy);
    this.setState({
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  onEndEditing(item, value) {
    realm.write(() => {
      // console.log('In edit write for : '+ item.name);
      item.defaultPackSize = parseFloat(value);
    });
  }

  getHeader() {
    return (
      <Header>
        <HeaderCell style={styles.text} width={1}>Item Code</HeaderCell>
        <HeaderCell style={styles.text}
          width={5}
          onPress={() => this.nameSort()}
        >
          Item Name
        </HeaderCell>
        <HeaderCell style={styles.packSize} width={2}>Default Pack Size</HeaderCell>
      </Header>
    );
  }

  nameSort() {
    // console.log(`Sort direction on name column pressed ${this.state.reverseSort}`);
    this.setState({
      reverseSort: this.state.reverseSort !== true,
    });
    const data = this.state.items.sorted(this.state.sortBy, this.state.reverseSort);
    this.setState({
      DataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  deleteButton(item) {
    // TODO: needs a modal dialog, deleting needs confirmation!!
    // console.log("Pressed deleteButton for item: " + item.name);
    realm.write(() => {
      realm.delete(item);
    });

    const ids = this.state.items.map(i => i.id);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.state.items, ids),
    });
  }

  expansion(item) {
    return (
      <Expansion>
        <ExpansionView>
          <Text style={styles.text}>Department: {item.department.name}</Text>
          <Text style={styles.text}>Description: {item.description}</Text>
        </ExpansionView>
        <TableButton onPress={() => this.deleteButton(item)}>
          <Text style={styles.text} >Delete Item</Text>
        </TableButton>
      </Expansion>
    );
  }

  renderRow(item) {
  //  console.log("Row of rendered for: " + item.code)
    return (
      <Row expansion={() => this.expansion(item)}>
        <RowView>
          <Cell style={styles.text} width={1}>{item.code}</Cell>
          <Cell style={styles.text} width={5}>{item.name}</Cell>
          <EditableCell
            style={styles.packSize}
            width={2}
            keyboardType="number-pad"
            onEndEditing={this.onEndEditing}
            target={item}
            value={item.defaultPackSize}
          />
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
          renderRow={this.renderRow}
          header={this.getHeader}
          searchBar={this.onSearchChange}
        />
      </View>
    );
  }
}
