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

import {
  Cell,
  DataTable,
  EditableCell,
  Expansion,
  Header,
  HeaderCell,
  Row,
  TableButton,
} from '../widgets/DataTable';

import { ListView } from 'realm/react-native';

export class Catalogue extends Component {

  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource,
      query: 'item_name=@',
      items: props.database.objects('Item'),
      sortBy: 'name',
      reverseSort: false,
      loaded: false,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.onDeleteBtnPress = this.onDeleteBtnPress.bind(this);
    this.onEndDefaultPackSizeEdit = this.onEndDefaultPackSizeEdit.bind(this);
    this.renderExpansion = this.renderExpansion.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    const data = this.state.items.sorted(this.state.sortBy);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
      loaded: true,
    });
  }


  onSearchChange(event) {
    const term = event.nativeEvent.text;
    const { items, sortBy, dataSource, reverseSort } = this.state;
    const data = items.filtered(`${sortBy} CONTAINS[c] $0`, term).sorted(sortBy, reverseSort);
    this.setState({
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  onEndDefaultPackSizeEdit(item, value) {
    // TODO: Needs to check if value is correct type (i.e. Number).
    // Show dialog/error if wrong type. Might have to rerender
    // to show old value. Such a dialog/modal should be a common
    // component.
    const { database } = this.props;
    database.write(() => {
      database.create('Item', { id: item.id, defaultPackSize: value }, true);
    });
  }

  onColumnSort() {
    this.setState({
      reverseSort: this.state.reverseSort !== true,
    });
    const data = this.state.items.sorted(this.state.sortBy, this.state.reverseSort);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  onDeleteBtnPress(item) {
    // TODO: needs a modal dialog, deleting needs confirmation!!
    const { dataSource, items, sortBy, reverseSort } = this.state;
    const { database } = this.props;
    database.write(() => {
      database.delete(item);
    });

    this.setState({
      dataSource: dataSource.cloneWithRows(items.sorted(sortBy, reverseSort)),
    });
  }

  renderHeader() {
    return (
      <Header>
        <HeaderCell style={styles.text} width={1}>Item Code</HeaderCell>
        <HeaderCell style={styles.text}
          width={5}
          onPress={() => this.onColumnSort()}
        >
          Item Name
        </HeaderCell>
        <HeaderCell style={styles.packSize} width={2}>Default Pack Size</HeaderCell>
      </Header>
    );
  }

  renderExpansion(item) {
    return (
      <Expansion>
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
          <Text style={styles.text}>Department: {item.department.name}</Text>
          <Text style={styles.text}>Description: {item.description}</Text>
        </View>
        <TableButton onPress={() => this.onDeleteBtnPress(item)}>
          <Text style={styles.text} >Delete Item</Text>
        </TableButton>
      </Expansion>
    );
  }

  renderRow(item) {
    return (
      <Row renderExpansion={() => this.renderExpansion(item)}>
        <Cell style={styles.text} width={1}>{item.code}</Cell>
        <Cell style={styles.text} width={5}>{item.name}</Cell>
        <EditableCell
          style={styles.packSize}
          width={2}
          keyboardType="number-pad"
          onEndEditing={this.onEndDefaultPackSizeEdit}
          target={item}
          value={item.defaultPackSize}
        />
      </Row>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Text Component outside of DataTable</Text>
        <DataTable
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
          searchBar={this.onSearchChange}
        />
      </View>
    );
  }
}

Catalogue.propTypes = {
  database: React.PropTypes.object,
};

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
  DataTable: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});
