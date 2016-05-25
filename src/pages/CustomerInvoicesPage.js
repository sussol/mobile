/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React, {
  Component,
  StyleSheet,
  TextInput,
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
import globalStyles from '../globalStyles';

export default class StockPage extends Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource,
      items: props.database.objects('Transaction').filtered('type == "customer_invoice"'),
      searchTerm: '',
      sortBy: 'id',
      reverseSort: false,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    const data = this.state.items.sorted(this.state.sortBy);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
      deleteTargetItem: this.state.items[0],
    });
  }

  onSearchChange(event) {
    const term = event.nativeEvent.text;
    const { items, sortBy, dataSource, reverseSort } = this.state;
    this.setState({
      searchTerm: term,
    });
    const data = items.filtered(`id CONTAINS[c] "${term}"`).sorted(sortBy, reverseSort);
    this.setState({
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  onColumnSort(newSortBy) {
    this.setState({
      sortBy: newSortBy,
      reverseSort: this.state.reverseSort !== true,
    });
    const { items, sortBy, dataSource, reverseSort, searchTerm } = this.state;
    const data = items.filtered(`id CONTAINS[c] "${searchTerm}"`).sorted(sortBy, reverseSort); // change id to search name instead, somehow
    this.setState({
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.dataTableHeader}>
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, localStyles.text]}
          onPress={() => this.onColumnSort('otherParty.name')} // change id to search name instead, somehow
          width={columnWidths[0]}
          text={'Customer'}
        />
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[1]}
          onPress={() => this.onColumnSort('id')}
          text={'ID'}
        />
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[2]}
          onPress={() => this.onColumnSort('status')}
          text={'STATUS'}
        />
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[3]}
          onPress={() => this.onColumnSort('entryDate')}
          text={'ENTERED DATE'}
        />
        <HeaderCell
          style={[globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[4]}
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
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[0]}
        >
          {invoice.otherParty.name}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[1]}
        >
          {invoice.id}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[2]}
        >
          {invoice.status}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[3]}
        >
          {invoice.entryDate.toDateString()}
        </Cell>
        <Cell
          style={[globalStyles.dataTableCell, localStyles.cellLast]}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[4]}
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
          <TextInput
            style={globalStyles.searchBar}
            onChange={(event) => this.onSearchChange(event)}
            placeholder="Search"
          />
          <Button
            style={{ flex: 1 }}
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

StockPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
  style: View.propTypes.style,
};
const columnWidths = [4, 1, 1, 2, 4];
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    width: 140,
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
  cellLast: {
    borderRightWidth: 0,
  },
  dataTable: {
    flex: 1,
  },
});
