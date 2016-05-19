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
  getItemQuantity,
  getItemQuantitiesOnDate,
} from '../utilities';

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

import globalStyles from '../globalStyles';
import { ConfirmModal } from '../widgets';
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
      deleteTargetItem: {},
      deleteModalOpen: false,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.onDeleteBtnPress = this.onDeleteBtnPress.bind(this);
    this.onDeleteConfirm = this.onDeleteConfirm.bind(this);
    this.onEndDefaultPackSizeEdit = this.onEndDefaultPackSizeEdit.bind(this);
    this.renderExpansion = this.renderExpansion.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    const data = this.state.items.sorted(this.state.sortBy);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
      deleteTargetItem: this.state.items[0],
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
      database.update('Item', { id: item.id, defaultPackSize: parseFloat(value) });
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
    this.setState({
      deleteTargetItem: item,
      deleteModalOpen: true,
    });
  }

  onDeleteConfirm(item) {
    const { dataSource, items, sortBy, reverseSort } = this.state;
    const { database } = this.props;

    database.write(() => {
      database.delete('Item', item);
    });

    const data = items.sorted(sortBy, reverseSort);
    this.setState({
      dataSource: dataSource.cloneWithRows(data),
      deleteModalOpen: false,
    });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.header}>
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={[globalStyles.text, styles.text]}
          width={1}
          text={'Item Code'}
        />
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={[globalStyles.text, styles.text]}
          width={1}
          onPress={() => this.onColumnSort()}
          text={'Item Name'}
        />
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={[globalStyles.text, styles.text]}
          width={2}
          text={'Default Pack Size'}
        />
      </Header>
    );
  }

  renderExpansion(item) {
    return (
      <Expansion>
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
          <Text style={[globalStyles.text, styles.text]}>Department: {item.department.name}</Text>
          <Text style={[globalStyles.text, styles.text]}>Description: {item.description}</Text>
        </View>
        <TableButton style={globalStyles.tableButton} onPress={() => this.onDeleteBtnPress(item)}>
          <Text style={[globalStyles.text, styles.text]}>Delete Item</Text>
        </TableButton>
      </Expansion>
    );
  }

  renderRow(item) {
    return (
      <Row style={globalStyles.row} renderExpansion={() => this.renderExpansion(item)}>
        <Cell
          style={globalStyles.cell}
          textStyle={[globalStyles.text, styles.text]}
          width={1}
        >
          {item.code}
        </Cell>
        <Cell
          style={globalStyles.cell}
          textStyle={[globalStyles.text, styles.text]}
          width={1}
        >
          {item.name}
        </Cell>
        <EditableCell
          style={[globalStyles.cell, globalStyles.editableCell]}
          textStyle={[globalStyles.text, globalStyles.editableCell, styles.packSize]}
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
    const items = this.props.database.objects('Item');
    const date = new Date();
    date.setDate(date.getDate() - 182.5);

    const start = new Date().getTime();
    const testoutput = getItemQuantitiesOnDate(items, date, this.props.database);
    const end = new Date().getTime();

    return (
      <View style={globalStyles.container}>
        <Text>getItemQuantitiesOnDate Time taken: {end - start}</Text>
        <DataTable
          style={globalStyles.container}
          listViewStyle={globalStyles.container}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
          searchBar={this.onSearchChange}
          searchBarStyle={globalStyles.searchBar}
        />
        <ConfirmModal
          isOpen={this.state.deleteModalOpen}
          style={[globalStyles.modal, styles.modal]}
          textStyle={globalStyles.text}
          questionText={`Are you sure you want to delete ${
            this.state.deleteTargetItem.isValid() ?
            this.state.deleteTargetItem.name : 'undefined'
          }`}
          onCancel={() => this.setState({ deleteModalOpen: false })}
          onConfirm={() => this.onDeleteConfirm(this.state.deleteTargetItem)}
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
  modal: {
    backgroundColor: 'red', // for hurting your eyes
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
