/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import globalStyles from '../globalStyles';

import {
  Cell,
  DataTable,
  EditableCell,
  Header,
  HeaderCell,
  Row,
} from '../widgets/DataTable';

import { ListView } from 'realm/react-native';
import { SearchBar } from '../widgets';

/**
 * Provides a generic implementation of a standard page in mSupply Mobile, which
 * contains a searchable table. Should always be overridden, in particular the
 * following methods and instance variables (fields):
 * @method getUpdatedData(searchTerm, sortBy, isAscending) Should return updated data
 * @method renderCell(key, item) Should define what to render in a cell with the
 *         											 given column key and database item
 * @method onRowPress(key, item) Should define behaviour when a row is pressed,
 *         											 don't override if row should not be pressable
 * @method onEndEditing(key, item, newValue) Handles user input to an editable cell
 *         											 don't override if row should not be pressable
 * @field  {array}  columns      An array of objects defining each of the columns.
 *         											 Each column must contain: key, width, title. Each
 *         											 may optionally also contain a boolean 'sortable'.
 * @state  {ListView.DataSource} dataSource    DataTable input, used to update rows
 *         																		 being rendered
 * @state  {string}              searchTerm    Current term user has entered in search bar
 * @state  {string}              sortBy        The property to sort by (is selected
 *                                             by column press).
 * @state  {boolean}             isAscending   Direction sortBy should sort
 *                                             (ascending/descending:true/false).
 */
export class GenericTablePage extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource,
      searchTerm: '',
      sortBy: '',
      isAscending: true,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderCell = this.renderCell.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.columns = null;
  }

  componentWillMount() {
    this.refreshData();
  }

  onSearchChange(event) {
    const term = event.nativeEvent.text;
    this.setState({ searchTerm: term }, this.refreshData);
    this.refreshData();
  }

  onColumnSort(sortBy) {
    if (this.state.sortBy === sortBy) { // changed column sort direction.
      this.setState({ isAscending: !this.state.isAscending }, this.refreshData);
    } else { // Changed sorting column.
      this.setState({
        sortBy: sortBy,
        isAscending: true,
      }, this.refreshData);
    }
  }

  refreshData() {
    const { dataSource, searchTerm, sortBy, isAscending } = this.state;
    const data = this.getUpdatedData(searchTerm, sortBy, isAscending);
    this.setState({ dataSource: dataSource.cloneWithRows(data) });
  }

  renderCell() {
    return 'DEFAULT CELL';
  }

  renderHeader() {
    const headerCells = [];
    this.columns.forEach((column) => {
      const sortFunction = column.sortable ? () => this.onColumnSort(column.key) : null;
      headerCells.push(
        <HeaderCell
          key={column.key}
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={column.width}
          onPress={sortFunction}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === column.key}
          text={column.title}
        />
      );
    });
    return (
      <Header style={globalStyles.header}>
        {headerCells}
      </Header>
    );
  }

  renderRow(item) {
    const cells = [];
    this.columns.forEach((column) => {
      let cell;
      if (column.editable) {
        cell = (
          <EditableCell
            key={column.key}
            style={globalStyles.dataTableCell}
            textStyle={globalStyles.dataTableText}
            width={column.width}
            onEndEditing={this.onEndEditing &&
                          ((target, value) => this.onEndEditing(column.key, target, value))}
            target={item}
            value={this.renderCell(column.key, item)}
          />);
      } else {
        cell = (
          <Cell
            key={column.key}
            style={globalStyles.dataTableCell}
            textStyle={globalStyles.dataTableText}
            width={column.width}
          >
            {this.renderCell(column.key, item)}
          </Cell>);
      }
      cells.push(cell);
    });
    return (
      <Row
        style={globalStyles.dataTableRow}
        onPress={this.onRowPress && (() => this.onRowPress(item))}
      >
        {cells}
      </Row>
    );
  }

  renderSearchBar() {
    return (
      <SearchBar
        onChange={(event) => this.onSearchChange(event)}
      />);
  }

  renderDataTable() {
    return (
      <DataTable
        style={globalStyles.dataTable}
        listViewStyle={localStyles.listView}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        renderHeader={this.renderHeader}
      />);
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            {this.renderSearchBar()}
          </View>
          {this.renderDataTable()}
        </View>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  listView: {
    flex: 1,
  },
  rightMostCell: {
    borderRightWidth: 0,
  },
  dataTable: {
    flex: 1,
  },
});
