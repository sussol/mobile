/* @flow weak */

/**
 * OfflineMobile Android Stocktakes Page
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

import Icon from 'react-native-vector-icons/Ionicons';
import { generateUUID } from '../database';
import { ListView } from 'realm/react-native';
import { Button } from '../widgets';
import globalStyles from '../globalStyles';

/**
* Renders the page for displaying Stocktakes.
* @prop   {Realm}               database    App wide database.
* @prop   {func}                navigateTo  callBack for navigation stack.
* @state  {ListView.DataSource} dataSource  DataTable input, used to update rows being rendered.
* @state  {Realm.Results}       Stocktakes  Filtered to have only customer_stocktake.
* @state  {string}              sortBy      Locked to createdDate created date column.
* @state  {boolean}             isAscending Direction sortBy should sort
*                                           (ascending/descending:true/false).
*/
export class StocktakesPage extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource,
      stocktakes: props.database.objects('Stocktake'),
      sortBy: 'createdDate',
      isAscending: false,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.deleteSelection = this.deleteSelection.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.onNewStockTake = this.onNewStockTake.bind(this);
  }

  componentWillMount() {
    this.refreshData();
  }

  onColumnSort() {
    this.setState({
      isAscending: !this.state.isAscending,
    });
    this.refreshData();
  }

  onNewStockTake() {
    this.props.database.write(() => {
      this.props.database.create('Stocktake', {
        id: generateUUID(),
        name: 'best stocktake',
        createdDate: new Date(),
        status: 'new',
        comment: 'Testing StocktakesPage',
        serialNumber: '1337',
        lines: [],
      });
    });
    this.props.navigateTo('stocktakeManager', 'New StockTake');
  }

  /**
   * Takes an array of stocktakes and deletes them from database
   * @param {array} stocktakes  the array of stocktakes to delete
   */
  deleteSelection(stocktakes) {
    this.props.database.write(() => {
      for (const stocktake in stocktakes) {
        if (stocktakes.hasOwnProperty(stocktake)) {
          this.props.database.delete('Stocktake', stocktake);
        }
      }
    });
    this.refreshData();
  }

  /**
   * Updates data within dataSource in state according to the state of sortBy and
   * isAscending. This sort by on this page is always 'createdDate'.
   */
  refreshData() {
    const { stocktakes, sortBy, dataSource, isAscending } = this.state;
    const data = stocktakes.sorted(sortBy, !isAscending); // 2nd arg: reverse sort order if true
    this.setState({ dataSource: dataSource.cloneWithRows(data) });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.dataTableHeader}>
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[0]}
          text={'DESCRIPTION'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[1]}
          onPress={() => this.onColumnSort()}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === 'createdDate'}
          text={'CREATED DATE'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[2]}
          text={'STATUS'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[3]}
          text={'DELETE'}
        />
      </Header>
    );
  }

  renderRow(stocktake) {
    return (
      <Row
        style={globalStyles.dataTableRow}
        onPress={() => this.props.navigateTo('stocktakes', `StockTake ${stocktake.serialNumber}`)}
      >
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[0]}
        >
          {stocktake.comment}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[1]}
        >
          {stocktake.createdDate.toISOString()}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[2]}
        >
          {stocktake.status}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[3]}
        >
          <Icon name="md-remove-circle" size={15} color="grey" />
        </Cell>
      </Row>
    );
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.horizontalContainer}>
            <Button
              style={globalStyles.button}
              textStyle={globalStyles.buttonText}
              text="New StockTake"
              onPress={this.onNewStockTake}
            />
          </View>
          <DataTable
            style={globalStyles.dataTable}
            listViewStyle={localStyles.listView}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            renderHeader={this.renderHeader}
          />
        </View>
      </View>
    );
  }
}

StocktakesPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};
const COLUMN_WIDTHS = [6, 2, 2, 1];
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
