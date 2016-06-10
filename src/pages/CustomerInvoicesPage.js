/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import {
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

import { generateUUID } from '../database';
import { ListView } from 'realm/react-native';
import { Button, SearchBar } from '../widgets';
import globalStyles from '../globalStyles';

/**
* Renders the page for displaying CustomerInvoices.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {ListView.DataSource} dataSource    DataTable input, used to update rows being rendered.
* @state  {Realm.Results}       transactions  Filtered to have only customer_invoice.
* @state  {string}              searchTerm    Current term user has entered in the SearchBar.
* @state  {string}              sortBy        The property of the transaction to sort by (isSelected
*                                             by column press).
* @state  {boolean}             isAscending   Direction sortBy should sort
*                                             (ascending/descending:true/false).
*/
export class CustomerInvoicesPage extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource,
      transactions: props.database.objects('Transaction').filtered('type == "customer_invoice"'),
      searchTerm: '',
      sortBy: 'otherParty.name',
      isAscending: true,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.onNewInvoice = this.onNewInvoice.bind(this);
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
    } else { // Changed sorting column
      this.setState({
        sortBy: sortBy,
        isAscending: true,
      });
    }
    this.refreshData();
  }

  onNewInvoice() {
    this.props.database.write(() => {
      this.props.database.create('Transaction', {
        id: generateUUID(),
        serialNumber: '1',
        entryDate: new Date(),
        type: 'customer_invoice',
        status: 'new',
        comment: 'Testing sync',
      });
    });
    this.props.navigateTo('customerInvoice', 'New Invoice');
  }

  /**
   * Updates data within dataSource in state according to the state of searchTerm, sortBy and
   * isAscending. Special case for otherParty.name as realm does not allow sorting on
   * object properties properties.
   */
  refreshData() {
    const { transactions, sortBy, dataSource, isAscending, searchTerm } = this.state;
    let data = transactions.filtered(`otherParty.name CONTAINS[c] "${searchTerm}"`);
    if (sortBy === 'otherParty.name') {
      // Convert to javascript array obj then sort with standard array functions.
      data = data.slice().sort((a, b) => a.otherParty.name.localeCompare(b.otherParty.name));
      if (!isAscending) data.reverse();
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
          width={COLUMN_WIDTHS[0]}
          onPress={() => this.onColumnSort('otherParty.name')}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === 'otherParty.name'}
          text={'CUSTOMER'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[1]}
          onPress={() => this.onColumnSort('id')}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === 'id'}
          text={'ID'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[2]}
          onPress={() => this.onColumnSort('status')}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === 'status'}
          text={'STATUS'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[3]}
          onPress={() => this.onColumnSort('entryDate')}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === 'entryDate'}
          text={'ENTERED DATE'}
        />
        <HeaderCell
          style={[globalStyles.dataTableHeaderCell, localStyles.rightMostCell]}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[4]}
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
          width={COLUMN_WIDTHS[0]}
        >
          {invoice.otherParty.name}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[1]}
        >
          {invoice.id}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[2]}
        >
          {invoice.status}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[3]}
        >
          {invoice.entryDate.toDateString()}
        </Cell>
        <Cell
          style={[globalStyles.dataTableCell, localStyles.rightMostCell]}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[4]}
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
          />
          <Button
            style={globalStyles.button}
            textStyle={globalStyles.buttonText}
            text="New Invoice"
            onPress={this.onNewInvoice}
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

CustomerInvoicesPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};
const COLUMN_WIDTHS = [4, 1, 1, 2, 4];
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rightMostCell: {
    borderRightWidth: 0,
  },
  dataTable: {
    flex: 1,
  },
});
