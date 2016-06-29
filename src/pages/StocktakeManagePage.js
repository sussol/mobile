/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import {
  Cell,
  CheckableCell,
  DataTable,
  Header,
  HeaderCell,
  Row,
} from '../widgets/DataTable';

import Icon from 'react-native-vector-icons/Ionicons';
import { generateUUID } from '../database';
import { ListView } from 'realm/react-native';
import { Button, BottomModal, TextInput, SearchBar, ToggleBar } from '../widgets';
import { getItemQuantity } from '../utilities';
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
      itemSelection: [],
      stocktake: {},
      stocktakeName: '',
      isNewStocktake: false,
      searchTerm: '',
      isAscending: true,
      isSelectAllItems: false,
      showNoStock: false,
      sortBy: 'name',
    };
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.onConfirmPress = this.onConfirmPress.bind(this);
  }

  componentWillMount() {
    if (!this.props.stocktake) {
      let stocktake;
      this.props.database.write(() => {
        stocktake = this.props.database.create('Stocktake', {
          id: generateUUID(),
          name: '',
          createdDate: new Date(),
          status: 'new',
          comment: 'Testing StocktakesPage',
          serialNumber: '1337',
          lines: [],
        });
      });
      this.setState({ stocktake: stocktake, isNewStocktake: true });
    } else {
      const selected = [];
      this.props.stocktake.lines.forEach((line) => {
        const item = line.itemLine.item;
        if (item) selected.push(item.id);
      });
      this.setState({
        stocktake: this.props.stocktake,
        itemSelection: selected,
        stocktakeName: this.props.stocktake.name,
      });
    }
    this.refreshData();
  }

  onColumnSort(newSortBy) {
    if (this.state.sortBy === newSortBy) { // changed column sort direction.
      this.setState({ isAscending: !this.state.isAscending });
    } else { // Changed sorting column.
      this.setState({
        sortBy: newSortBy,
        isAscending: true,
      });
    }
    this.refreshData();
  }

  onConfirmPress() {
    const { stocktake, itemSelection, items } = this.state;
    let { stocktakeName } = this.state;
    const stocktakeLines = [];

    if (stocktakeName === '') stocktakeName = `Stocktake ${stocktake.createdDate}`;

    this.props.database.write(() => {
      stocktake.lines.forEach((line, i, lines) => {
        const item = line.itemLine.item;
        const itemIdIndex = itemSelection.indexOf(item.id);
        // If a stocktakeLine for an item already exists in the stocktake, remove it from the
        // itemSelection array.
        if (itemIdIndex >= 0) {
          itemSelection.slice(itemIdIndex, 1);
        }
        // Remove stocktakeLines of items that are not in the selection.
        if (!itemSelection.includes(item.id)) lines.slice(i, 1);
      });

      itemSelection.forEach((itemId) => {
        const item = items.find(i => i.id === itemId);
        item.lines.forEach((itemLine) => {
          const stocktakeLine = this.props.database.create('StocktakeLine', {
            id: generateUUID(),
            stocktake: stocktake,
            itemLine: itemLine,
            snapshotNumberOfPacks: itemLine.numberOfPacks,
            packSize: 1,
            expiryDate: itemLine.numberOfPacks,
            batch: itemLine.numberOfPacks,
            costPrice: itemLine.numberOfPacks,
            sellPrice: itemLine.numberOfPacks,
          });
          stocktakeLines.push(stocktakeLine);
        });
      });

      stocktake.name = stocktakeName;
      stocktake.lines = stocktake.lines.concat(stocktakeLines);
      this.props.database.update('Stocktake', stocktake);
    });
  }

  onRadioButtonPress(item) {
    const newItemSelection = [...this.state.itemSelection];
    if (newItemSelection.indexOf(item.id) >= 0) {
      newItemSelection.splice(newItemSelection.indexOf(item.id), 1);
    } else {
      newItemSelection.push(item.id);
    }
    this.setState({ itemSelection: newItemSelection });
  }

  onSearchChange(event) {
    const term = event.nativeEvent.text;
    this.setState({ searchTerm: term });
    this.refreshData();
  }

  toggleSelectAllItems() {
    const isSelectAllItems = !this.state.isSelectAllItems;
    const { items } = this.state;
    this.setState({
      isSelectAllItems: isSelectAllItems,
      itemSelection: isSelectAllItems ? items.map(item => item.id) : [],
    }, this.refreshData);
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
    const {
      items,
      sortBy,
      dataSource,
      isAscending,
      searchTerm,
      itemSelection,
      showNoStock,
    } = this.state;
    let data;
    data = items.filtered(`name CONTAINS[c] "${searchTerm}"`);
    switch (sortBy) {
      // 'selected' case lists the selected items in alphabetical order, followed by unselected in
      // alphabetical order. This requires the itemSelection array to store the item ids in the
      // same alphabetical order as their respective items.
      case 'selected':
        itemSelection.sort((a, b) => {
          const aName = items.find(item => item.id === a).name;
          const bName = items.find(item => item.id === b).name;
          return bName.localeCompare(aName);
        });
        data = data.sorted('name', !isAscending).slice()
                  .sort((a, b) => itemSelection.indexOf(b.id) - itemSelection.indexOf(a.id));
        if (!isAscending) data.reverse();
        break;
      default:
        data = data.sorted(sortBy, !isAscending);
    }
    if (!showNoStock) {
      data = data.slice().filter((item) => getItemQuantity(item) !== 0);
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
          style={globalStyles.dataTableHeaderCell}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[2]}
          text={'SNAPSHOT QUANTITY'}
        />
        <HeaderCell
          style={[
            globalStyles.dataTableHeaderCell,
            globalStyles.dataTableRightMostCell,
          ]}
          textStyle={globalStyles.dataTableText}
          width={COLUMN_WIDTHS[3]}
          onPress={() => this.onColumnSort('selected')}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === 'selected'}
          text={'SELECTED'}
        />
      </Header>
    );
  }

  renderRow(item) {
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
        <CheckableCell
          style={[
            globalStyles.dataTableCell,
            globalStyles.dataTableRightMostCell,
            globalStyles.dataTableCheckableCell,
          ]}
          width={COLUMN_WIDTHS[3]}
          onPress={() => this.onRadioButtonPress(item)}
          renderIsChecked={<Icon name="md-radio-button-on" size={15} color={SUSSOL_ORANGE} />}
          renderIsNotChecked={<Icon name="md-radio-button-off" size={15} color={SUSSOL_ORANGE} />}
          isChecked={this.state.itemSelection.indexOf(item.id) >= 0}
        />
      </Row>
    );
  }

  render() {
    const { isSelectAllItems, showNoStock } = this.state;
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
                    text: 'Show No Stock',
                    onPress: () => this.toggleShowNoStock(),
                    isOn: showNoStock,
                  },
                  {
                    text: 'Select All Items',
                    onPress: () => this.toggleSelectAllItems(),
                    isOn: isSelectAllItems,
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
            style={localStyles.bottomModal}
          >
            <TextInput
              style={globalStyles.modalTextInput}
              textStyle={globalStyles.modalText}
              placeholderTextColor="white"
              placeholder="Give your stocktake a name"
              value={this.state.stocktakeName}
              onChange={(text) => this.setState({ stocktakeName: text })}
            />
            <Button
              style={[globalStyles.button, globalStyles.modalOrangeButton]}
              textStyle={[globalStyles.buttonText, globalStyles.modalButtonText]}
              text={this.state.isNewStocktake ? 'Create' : 'Confirm'}
              onPress={() => this.onConfirmPress}
            />
          </BottomModal>
        </View>
      </View>
    );
  }
}

StocktakeManagePage.propTypes = {
  stocktake: React.PropTypes.object,
  database: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
};
const COLUMN_WIDTHS = [2, 6, 2, 1];
const localStyles = StyleSheet.create({
  listView: {
    flex: 1,
  },
  bottomModal: {
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
  toggleBarView: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonViewTop: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dataTable: {
    flex: 1,
  },
});
