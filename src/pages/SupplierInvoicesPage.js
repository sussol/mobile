/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React, {
  Component,
  StyleSheet,
  View,
} from 'react-native';

import {
  Cell,
  DataTable,
  Header,
  HeaderCell,
  Row,
} from '../widgets/DataTable';

import { ListView } from 'realm/react-native';
import { Button, SearchBar } from '../widgets';
import globalStyles from '../globalStyles';

/**
* Renders the page for displaying SupplierInvoices.
* @prop {Realm} database   app wide database.
* @prop {func}  navigateTo   callBack for navigation stack.
* @state  {Realm} dataSource    app wide database (from prop).
* @state  {Realm.Results} transactions    filtered to have only supplier_invoice.
* @state  {string}  searchTerm    current term user has entered in the SearchBar.
* @state  {string}  sortBy    the property of the transaction to sort by (selected by column press).
* @state  {boolean} isAscending   direction sortBy should sort (ascending/descending:true/false).
*/
export default class SupplierInvoicePage extends Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource,
      transactions: props.database.objects('Transaction').filtered('type == "supplier_invoice"'),
      searchTerm: '',
      sortBy: 'serialNumber',
      isAscending: true,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.refreshData = this.refreshData.bind(this);
  }

  componentWillMount() {
    this.refreshData();
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.state.transactions),
      deleteTargetItem: this.state.transactions[0],
    });
  }

  onSearchChange(event) {
    const term = event.nativeEvent.text;
    this.setState({ searchTerm: term });
    this.refreshData();
  }

  onColumnSort(sortBy) {
    if (this.state.sortBy === sortBy) { // changed column sort direction.
      this.setState({ isAscending: !this.state.isAscending });
    } else { // Changed sorting column.
      this.setState({
        sortBy: sortBy,
        isAscending: true,
      });
    }
    this.refreshData();
  }

  /**
   * Updates data within dataSource in state according to the state of searchTerm, sortBy and
   * isAscending. Special case for sorting by serialNumber due to needing number based sorting but
   * the value is stored as a string.
   */
  refreshData() {
    const { transactions, sortBy, dataSource, isAscending, searchTerm } = this.state;
    let data = transactions.filtered(`serialNumber BEGINSWITH "${searchTerm}"`);
    if (sortBy === 'serialNumber') { // Special case for correct number based sorting
      // Convert to javascript array obj then sort with standard array functions.
      data = data.slice().sort((a, b) => Number(a.serialNumber) - b.serialNumber); // 0,1,2,3...
      if (!isAscending) data.reverse(); // ...3,2,1,0
    } else {
      data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
    }
    this.setState({ dataSource: dataSource.cloneWithRows(data) });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.dataTableHeader}>
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[0]}
          onPress={() => this.onColumnSort('serialNumber')}
          isAscending={this.state.isAscending}
          selected={this.state.sortBy === 'serialNumber'}
          text={'INVOICE NO.'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[1]}
          onPress={() => this.onColumnSort('status')}
          isAscending={this.state.isAscending}
          selected={this.state.sortBy === 'status'}
          text={'STATUS'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[2]}
          onPress={() => this.onColumnSort('entryDate')}
          isAscending={this.state.isAscending}
          selected={this.state.sortBy === 'entryDate'}
          text={'ENTERED DATE'}
        />
        <HeaderCell
          style={[globalStyles.dataTableHeaderCell, localStyles.rightMostCell]}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[3]}
          text={'COMMENT'}
        />
      </Header>
    );
  }

  renderRow(invoice) {
    return (
      <Row
        style={globalStyles.dataTableRow}
        onPress={() => this.props.navigateTo('customerInvoice', `Invoice ${invoice.serialNumber}`)}
      >
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[0]}
        >
          {invoice.serialNumber}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[1]}
        >
          {invoice.status}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[2]}
        >
          {invoice.entryDate.toDateString()}
        </Cell>
        <Cell
          style={[globalStyles.dataTableCell, localStyles.rightMostCell]}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[3]}
        >
          {invoice.comment}
        </Cell>
      </Row>
    );
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.horizontalContainer}>
          <SearchBar
            onChange={(event) => this.onSearchChange(event)}
            keyboardType="numeric"
          />
          <Button
            style={globalStyles.button}
            textStyle={globalStyles.buttonText}
            text="New Invoice"
            onPress={() => this.props.navigateTo('customerInvoice', 'New Invoice')}
          />
        </View>
        <DataTable
          style={globalStyles.dataTable}
          listViewStyle={globalStyles.container}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
        />
      </View>
    );
  }
}

SupplierInvoicePage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};
const columnWidths = [1, 1, 1, 3];
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    marginLeft: 20,
    textAlign: 'left',
  },
  rightMostCell: {
    borderRightWidth: 0,
  },
  dataTable: {
    flex: 1,
  },
});
