/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Cell,
  DataTable,
  Expansion,
  Header,
  HeaderCell,
  Row,
} from '../widgets/DataTable';

import { getItemQuantity } from '../utilities';
import { ListView } from 'realm/react-native';
import { SearchBar } from '../widgets/';
import globalStyles from '../globalStyles';

/**
* Renders the page for displaying all Items in the DB.
* @prop   {Realm}               database    App wide database.
* @prop   {func}                navigateTo  CallBack for navigation stack.
* @state  {ListView.DataSource} dataSource    DataTable input, used to update rows being rendered.
* @state  {Realm.Results}       items       Filtered to have only Item objects.
* @state  {string}              searchTerm  Current term user has entered in the SearchBar.
* @state  {string}              sortBy      The property of Item to sort by (isSelected
*                                           by column press).
* @state  {boolean}             isAscending Direction sortBy should sort
*                                           (ascending/descending:true/false).
*/
export default class StockPage extends Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource,
      items: props.database.objects('Item'),
      searchTerm: '',
      sortBy: 'name',
      isAscending: true,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.renderExpansion = this.renderExpansion.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    const data = this.state.items.sorted(this.state.sortBy);
    this.setState({ dataSource: this.state.dataSource.cloneWithRows(data) });
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

  refreshData() {
    const { items, sortBy, dataSource, isAscending, searchTerm } = this.state;
    const data = items.filtered(`name CONTAINS[c] "${searchTerm}"`).sorted(sortBy, !isAscending);
    this.setState({ dataSource: dataSource.cloneWithRows(data) });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.dataTableHeader}>
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[0]}
          onPress={() => this.onColumnSort('code')}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === 'code'}
          text={'ITEM CODE'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[1]}
          onPress={() => this.onColumnSort('name')}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === 'name'}
          text={'ITEM NAME'}
        />
        <HeaderCell
          style={[globalStyles.dataTableHeaderCell, localStyles.rightMostCell]}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[2]}
          text={'STOCK ON HAND'}
        />
      </Header>
    );
  }

  renderExpansion(item) {
    return (
      <Expansion>
        <View style={{ flex: COLUMN_WIDTHS[0] }} />
        <View style={{ flex: COLUMN_WIDTHS[1] + COLUMN_WIDTHS[2], flexDirection: 'row' }}>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
            <Text style={globalStyles.text}>
              Category: {item.category.name}
            </Text>
            <Text style={globalStyles.text}>
              Department: {item.department.name}
            </Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
            <Text style={globalStyles.text}>
              Number of batches: {item.lines.length}
            </Text>
            <Text style={globalStyles.text}>
              Nearest expiry: TODO: make function for this
            </Text>
          </View>
        </View>
      </Expansion>
    );
  }

  renderRow(item) {
    return (
      <Row style={globalStyles.dataTableRow} renderExpansion={() => this.renderExpansion(item)}>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[0]}
        >
          {item.code}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[1]}
        >
          {item.name}
        </Cell>
        <Cell
          style={[globalStyles.dataTableCell, localStyles.rightMostCell]}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[2]}
        >
          {getItemQuantity(item)}
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
};
const COLUMN_WIDTHS = [1.3, 7.2, 1.6];
const localStyles = StyleSheet.create({
  rightMostCell: {
    borderRightWidth: 0,
  },
  dataTable: {
    flex: 1,
  },
});
