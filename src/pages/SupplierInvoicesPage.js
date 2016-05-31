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
import Button from '../widgets/Button';
import SearchBar from '../widgets/SearchBar';
import globalStyles from '../globalStyles';

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
      reverseSort: false,
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
    if (this.state.sortBy === sortBy) {
      this.setState({ reverseSort: !this.state.reverseSort });
    } else {
      this.setState({
        sortBy: sortBy,
        reverseSort: false,
      });
    }
    this.refreshData();
  }

  refreshData() {
    const { transactions, sortBy, dataSource, reverseSort, searchTerm } = this.state;
    let data = transactions.filtered(`serialNumber BEGINSWITH "${searchTerm}"`);
    if (sortBy === 'serialNumber') {
      data = data.slice().sort((a, b) => Number(a.serialNumber) - b.serialNumber);
      if (reverseSort) data.reverse();
    } else {
      data = data.sorted(sortBy, reverseSort);
    }
    this.setState({ dataSource: dataSource.cloneWithRows(data) });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.dataTableHeader}>
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[0]}
          onPress={() => this.onColumnSort('serialNumber')}
          reverseSort={this.state.reverseSort}
          selected={this.state.sortBy === 'serialNumber'}
          text={'INVOICE NO.'}
        />
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[1]}
          onPress={() => this.onColumnSort('status')}
          reverseSort={this.state.reverseSort}
          selected={this.state.sortBy === 'status'}
          text={'STATUS'}
        />
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={globalStyles.dataTableText}
          width={columnWidths[2]}
          onPress={() => this.onColumnSort('entryDate')}
          reverseSort={this.state.reverseSort}
          selected={this.state.sortBy === 'entryDate'}
          text={'ENTERED DATE'}
        />
        <HeaderCell
          style={[globalStyles.dataTableHeaderCell]}
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
        <View style={localStyles.horizontalContainer}>
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
  style: View.propTypes.style,
};
const columnWidths = [1, 1, 1, 3];
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
