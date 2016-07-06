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

import { generateUUID } from '../database';
import { Button, BottomModal, TextInput, ToggleBar } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';
import { formatDateAndTime } from '../utilities';

const DATA_TYPES_DISPLAYED = ['Item', 'StocktakeItem'];

/**
* Renders the page for managing a stocktake.
* @prop   {Realm}               database    App wide database.
* @prop   {func}                navigateTo  CallBack for navigation stack.
* @state  {Realm.Results}       items       Realm.Result object containing all Items.
*/
export class StocktakeManagePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.items = props.database.objects('Item');
    this.state.stocktake = {};
    this.state.stocktakeName = '';
    this.state.isNewStocktake = false;
    this.state.isSelectAllItems = false;
    this.state.showItemsWithNoStock = false;
    this.state.sortBy = 'name';
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.onConfirmPress = this.onConfirmPress.bind(this);
  }

  componentWillMount() {
    this.databaseListenerId = this.props.database.addListener(this.onDatabaseEvent);
    if (!this.props.stocktake) {
      let stocktake;
      this.props.database.write(() => {
        const date = new Date();
        stocktake = this.props.database.create('Stocktake', {
          id: generateUUID(),
          name: `Stocktake ${formatDateAndTime(date, 'slashes')}`,
          createdDate: date,
          status: 'new',
          comment: 'Testing StocktakesPage',
          serialNumber: '1337',
          lines: [],
        });
      });
      this.setState({ stocktake: stocktake, isNewStocktake: true }, this.refreshData);
    } else {
      const selected = [];
      this.props.stocktake.items.forEach((stocktakeItem) => {
        const item = stocktakeItem.item;
        if (item) selected.push(item.id);
      });
      this.setState({
        stocktake: this.props.stocktake,
        selection: selected,
        stocktakeName: this.props.stocktake.name,
      }, this.refreshData);
    }
  }

  onConfirmPress() {
    const { stocktake, selection, items, isNewStocktake } = this.state;
    const { database, navigateTo } = this.props;
    let { stocktakeName } = this.state;
    const stocktakeItems = [];
    if (stocktakeName === '') {
      stocktakeName = stocktake.name;
    }

    database.write(() => {
      stocktake.items.forEach((stocktakeItem) => {
        const item = stocktakeItem.item;
        const itemIdIndex = selection.indexOf(item.id);
        // If a stocktakeItem for an item already exists in the stocktake, remove it from the
        // selection array.
        if (itemIdIndex >= 0) {
          selection.slice(itemIdIndex, 1);
        }
        // Remove StocktakeItem of Items that are not in the selection.
        if (!selection.some(id => id === item.id)) stocktake.deleteStocktakeItem(database, item);
      });

      selection.forEach((itemId) => {
        const item = items.find(i => i.id === itemId);
        const stocktakeItem = database.create('StocktakeItem', {
          id: generateUUID(),
          item: item,
          stocktake: stocktake,
          lines: [],
        });
        item.lines.forEach(line => {
          const stocktakeLine = database.create('StocktakeLine', {
            id: generateUUID(),
            stocktake: stocktake,
            itemLine: line,
            snapshotNumberOfPacks: line.totalQuantity,
            packSize: line.packSize,
            expiryDate: line.expiryDate,
            batch: line.batch,
            costPrice: line.costPrice,
            sellPrice: line.sellPrice,
            countedNumberOfPacks: 0,
            sortIndex: 0,
          });
          stocktakeItem.lines.push(stocktakeLine);
        });
        database.save('StocktakeItem', stocktakeItem);
        stocktakeItems.push(stocktakeItem);
      });
      stocktake.name = stocktakeName;
      stocktakeItems.forEach(item => stocktake.items.push(item));
      database.save('Stocktake', stocktake);
    });
    navigateTo(
      'stocktakeEditor',
      stocktake.name,
      { stocktake: stocktake },
      // coming from StocktakesPage : coming from StocktakesEditPage.
      isNewStocktake ? 'replace' : 'replacePreviousAndPop',
    );
  }

  toggleSelectAllItems() {
    const isSelectAllItems = !this.state.isSelectAllItems;
    const { items } = this.state;
    this.setState({
      isSelectAllItems: isSelectAllItems,
      selection: isSelectAllItems ? items.map(item => item.id) : [],
    }, this.refreshData);
  }

  toggleShowItemsWithNoStock() {
    this.setState({
      showItemsWithNoStock: !this.state.showItemsWithNoStock,
    }, this.refreshData);
  }

  /**
   * Updates data within dataSource in state according to sortBy and
   * isAscending. Also filters data according to showItemsWithNoStock.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    const {
      items,
      selection,
      showItemsWithNoStock,
    } = this.state;
    let data;
    data = items.filtered(`name BEGINSWITH[c] "${searchTerm}"`);
    switch (sortBy) {
      // 'selected' case lists the selected items in alphabetical order, followed by unselected in
      // alphabetical order. This requires the selection array to store the item ids in the
      // same alphabetical order as their respective items.
      case 'selected':
        selection.sort((a, b) => {
          const aName = items.find(item => item.id === a).name;
          const bName = items.find(item => item.id === b).name;
          return bName.localeCompare(aName);
        });
        data = data.sorted('name', !isAscending).slice()
                  .sort((a, b) => selection.indexOf(b.id) - selection.indexOf(a.id));
        if (!isAscending) data.reverse();
        break;
      default:
        data = data.sorted(sortBy, !isAscending);
    }
    if (!showItemsWithNoStock) {
      data = data.slice().filter((item) => item.totalQuantity !== 0);
    }
    return data;
  }

  renderCell(key, item) {
    switch (key) {
      default:
      case 'code':
        return item.code;
      case 'name':
        return item.name;
      case 'snapshotQuantity': {
        const stocktakeItem = this.state.stocktake.items.find(sti => sti.item.id === item.id);
        if (stocktakeItem) return stocktakeItem.snapshotTotalQuantity;
        return item.totalQuantity;
      }
      case 'selected':
        return {
          type: 'checkable',
        };
    }
  }

  render() {
    const {
      isSelectAllItems,
      showItemsWithNoStock,
      stocktake,
      selection,
      isNewStocktake,
    } = this.state;
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            {this.renderSearchBar()}
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
                    onPress: () => this.toggleShowItemsWithNoStock(),
                    isOn: showItemsWithNoStock,
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
          {this.renderDataTable()}
          <BottomModal
            isOpen={!stocktake.isFinalised && !isNewStocktake || selection.length > 0}
            style={localStyles.bottomModal}
          >
            <TextInput
              style={globalStyles.modalTextInput}
              textStyle={globalStyles.modalText}
              placeholderTextColor="white"
              placeholder="Give your stocktake a name"
              value={this.state.stocktakeName}
              onChangeText={(text) => this.setState({ stocktakeName: text })}
            />
            <Button
              style={[globalStyles.button, globalStyles.modalOrangeButton]}
              textStyle={[globalStyles.buttonText, globalStyles.modalButtonText]}
              text={isNewStocktake ? 'Create' : 'Confirm'}
              onPress={() => this.onConfirmPress()}
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

const COLUMNS = [
  {
    key: 'code',
    width: 2,
    title: 'ITEM CODE',
    sortable: true,
  },
  {
    key: 'name',
    width: 6,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'snapshotQuantity',
    width: 2,
    title: 'SNAPSHOT QUANTITY',
  },
  {
    key: 'selected',
    width: 1,
    title: 'SELECTED',
    sortable: true,
  },
];

const localStyles = StyleSheet.create({
  bottomModal: {
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
  toggleBarView: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
