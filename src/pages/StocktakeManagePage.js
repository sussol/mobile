/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
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
import { Button, BottomModal, TextInput, SearchBar, ToggleBar } from '../widgets';
import globalStyles, { SUSSOL_ORANGE } from '../globalStyles';

/**
* Renders the page for displaying Stocktakes.
* @prop   {Realm}               database        App wide database.
* @prop   {func}                navigateTo      callback for navigation stack.
* @state  {string}              SORT_BY         Locked to createdDate via created date column.
* @state  {ListView.DataSource} dataSource      DataTable input, used to update rows being rendered.
* @state  {Realm.Results}       Stocktakes      Results object containing all objects in the
*                                               Database of type Stocktake.
* @state  {boolean}             isAscending     Direction SORT_BY should sort.
*                                               (ascending/descending:true/false).
* @state  {boolean}             showNoStock     Boolean control of toggle bar options.
* @state  {array}               itemSelection Stores id of the stocktakes selected for deletion.
*/
export class StocktakeManagePage extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource,
      items: props.database.objects('Item'),
      searchTerm: '',
      isAscending: false,
      showSelected: true,
      showNoStock: false,
      sortBy: 'name',
      stocktakeName: '',
      itemSelection: [],
    };
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.onNewStockTake = this.onNewStockTake.bind(this);
  }

  componentWillMount() {
    this.refreshData();
  }

  onColumnSort(newSortBy) {
    this.setState({ isAscending: !this.state.isAscending, sortBy: newSortBy });
    this.refreshData();
  }

  onNewStockTake() {
    this.props.database.write(() => {
      this.props.database.create('Stocktake', {
        id: generateUUID(),
        name: 'best item',
        createdDate: new Date(),
        status: 'new',
        comment: 'Testing StocktakesPage',
        serialNumber: '1337',
        lines: [],
      });
    });
    this.props.navigateTo('stocktakeManager', 'New StockTake');
  }

  onRadioButtonPress(item) {
    const { itemSelection } = this.state;
    if (itemSelection.indexOf(item.id) >= 0) {
      itemSelection.splice(itemSelection.indexOf(item.id), 1);
    } else {
      itemSelection.push(item.id);
    }
    this.refreshData();
  }

  onSearchChange(event) {
    const term = event.nativeEvent.text;
    this.setState({ searchTerm: term });
    this.refreshData();
  }

  toggleShowSelected() {
    this.setState({
      showSelected: !this.state.showSelected,
    });
    this.refreshData();
  }

  toggleShowNoStock() {
    this.setState({
      showNoStock: !this.state.showNoStock,
    });
    this.refreshData();
  }

  /**
   * Updates data within dataSource in state according to SortBy and
   * isAscending.
   */
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
          isSelected={true}
          text={'ITEM CODE'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[1]}
          onPress={() => this.onColumnSort('name')}
          isAscending={this.state.isAscending}
          isSelected={true}
          text={'ITEM NAME'}
        />
        <HeaderCell
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[2]}
          text={'SNAPSHOT QUANTITY'}
        />
        <HeaderCell
          style={[
            globalStyles.dataTableHeaderCell,
            localStyles.rightMostCell,
            localStyles.selectedCell,
          ]}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[3]}
          onPress={() => this.onColumnSort('selected')}
          isAscending={this.state.isAscending}
          isSelected={true}
          text={'SELECTED'}
        />
      </Header>
    );
  }

  renderRow(item) {
    const radioButton = this.state.itemSelection.indexOf(item.id) >= 0 ?
              <Icon name="md-radio-button-on" size={15} color={SUSSOL_ORANGE} /> :
              <Icon name="md-radio-button-off" size={15} color={SUSSOL_ORANGE} />;
    return (
      <Row
        style={globalStyles.dataTableRow}
        onPress={() => this.props.navigateTo('stocktakeManager', 'Create Stocktake')}
      >
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
          style={globalStyles.dataTableCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[2]}
        >
          {item.quantity}
        </Cell>
        <TouchableOpacity
          style={{ flex: COLUMN_WIDTHS[3] }}
          onPress={() => this.onRadioButtonPress(item)}
        >
          <Cell
            style={[
              globalStyles.dataTableCell,
              localStyles.rightMostCell,
              localStyles.selectedCell,
            ]}
            textStyle={globalStyles.dataTableText}
            width={COLUMN_WIDTHS[3]}
          >
            {radioButton}
          </Cell>
        </TouchableOpacity>
      </Row>
    );
  }

  render() {
    const { showSelected, showNoStock } = this.state;
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <SearchBar
              onChange={(event) => this.onSearchChange(event)}
            />
            <View style={localStyles.toggleBarView}>
              <ToggleBar
                style={globalStyles.toggleBar}
                textOffStyle={globalStyles.toggleText}
                textOnStyle={globalStyles.toggleTextSelected}
                toggleOffStyle={globalStyles.toggleOption}
                toggleOnStyle={globalStyles.toggleOptionSelected}
                toggles={[
                  {
                    text: 'Show Selected',
                    onPress: () => this.toggleShowSelected(),
                    isOn: showSelected,
                  },
                  {
                    text: 'Show No Stock',
                    onPress: () => this.toggleShowNoStock(),
                    isOn: showNoStock,
                  },
                ]}
              />
            </View>
          </View>
          <DataTable
            style={globalStyles.dataTable}
            listViewStyle={localStyles.listView}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            renderHeader={this.renderHeader}
          />
          <BottomModal
            isOpen={this.state.itemSelection.length > 0}
          >
            <TextInput
              style={localStyles.modalTextInput}
              textStyle={localStyles.modalTextInputText}
              placeholderTextColor="white"
              placeholder="Give your stocktake a name"
              value={this.state.stocktakeName}
              onChange={(text) => this.setState({ stocktakeName: text })}
            />
          </BottomModal>
        </View>
      </View>
    );
  }
}

StocktakeManagePage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};
const COLUMN_WIDTHS = [2, 6, 2, 1];
const localStyles = StyleSheet.create({
  listView: {
    flex: 1,
  },
  modalTextInput: {
    width: 560,
    borderColor: 'white',
  },
  modalTextInputText: {
    color: 'white',
  },
  toggleBarView: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonViewTop: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  selectedCell: {
    alignItems: 'center',
  },
  rightMostCell: {
    borderRightWidth: 0,
  },
  dataTable: {
    flex: 1,
  },
});
