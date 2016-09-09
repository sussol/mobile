/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { Button, BottomModal, TextInput, ToggleBar } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';
import { createRecord } from '../database';
import { buttonStrings, modalStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Item', 'ItemBatch'];

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
    this.state.visibleItemIds = [];
    this.state.stocktakeName = '';
    this.state.showItemsWithNoStock = true;
    this.state.sortBy = 'name';
    this.columns = COLUMNS;
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.onConfirmPress = this.onConfirmPress.bind(this);
  }

  componentWillMount() {
    this.databaseListenerId = this.props.database.addListener(this.onDatabaseEvent);
    if (this.props.stocktake) {
      const selected = [];
      this.props.stocktake.items.forEach((stocktakeItem) => {
        const itemId = stocktakeItem.itemId;
        if (itemId !== '') selected.push(itemId);
      });
      this.setState({
        selection: selected,
        stocktakeName: this.props.stocktake.name,
      }, this.refreshData);
    } else {
      this.refreshData();
    }
  }

  onConfirmPress() {
    this.props.runWithLoadingIndicator(() => {
      const { selection } = this.state;
      const { database, navigateTo, currentUser } = this.props;
      let { stocktake } = this.props;
      const { stocktakeName } = this.state;

      database.write(() => {
        // If no stocktake came in props, make a new one
        if (!stocktake) stocktake = createRecord(database, 'Stocktake', currentUser);

        stocktake.setItemsByID(database, selection);

        if (stocktakeName !== '' && stocktakeName !== stocktake.name) {
          stocktake.name = stocktakeName;
        }
        database.save('Stocktake', stocktake);
      });

      navigateTo(
        'stocktakeEditor',
        stocktake.name,
        { stocktake: stocktake },
        // Coming from StocktakesPage : coming from StocktakeEditPage.
        !this.props.stocktake ? 'replace' : 'replacePreviousAndPop',
      );
    });
  }

  toggleSelectAllItems(isAllItemsSelected) {
    const { visibleItemIds, selection } = this.state;

    if (isAllItemsSelected) { // Deselect all visible items
      visibleItemIds.forEach((id) => {
        const idIndex = selection.indexOf(id);
        if (idIndex >= 0) {
          selection.splice(idIndex, 1);
        }
      });
    } else { // Add all ids in visibleItemIds that aren't already in selection
      visibleItemIds.forEach((id) => {
        if (!selection.includes(id)) {
          selection.push(id);
        }
      });
    }

    this.setState({
      selection: [...selection],
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
    data = items.filtered('name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0', searchTerm);
    switch (sortBy) {
      // 'selected' case lists the selected items in alphabetical order, followed by unselected in
      // alphabetical order. This requires the selection array to store the item ids in the
      // same alphabetical order as their respective items.
      case 'selected':
        // This sort making so many queries is likely why sorting by selected with all selected
        // takes so long. A potential refactor fix would be to have the realm objects themselves
        // stored in the array. If I understand how realm/JS behave, I'd think it'd just be pointers
        // to the objects in memory held by the results object, so shouldn't have any notable inpact
        // on memory.
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
    // Populate visibleItemIds with the ids of the items in the filtered data
    this.setState({ visibleItemIds: data.map((item) => item.id) });
    return data;
  }

  renderCell(key, item) {
    switch (key) {
      default:
        return item[key];
      case 'selected':
        return {
          type: 'checkable',
        };
    }
  }

  render() {
    const {
      visibleItemIds,
      showItemsWithNoStock,
      selection,
    } = this.state;
    const { stocktake } = this.props;
    const isAllItemsSelected = visibleItemIds.length > 0 && visibleItemIds.every((id) =>
                                                                selection.includes(id));

    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderSearchBar()}
            </View>
            <View style={localStyles.toggleBarView}>
              <ToggleBar
                style={globalStyles.toggleBar}
                textOffStyle={globalStyles.toggleText}
                textOnStyle={globalStyles.toggleTextSelected}
                toggleOffStyle={globalStyles.toggleOption}
                toggleOnStyle={globalStyles.toggleOptionSelected}
                toggles={[
                  {
                    text: buttonStrings.hide_stockouts,
                    onPress: () => this.toggleShowItemsWithNoStock(),
                    isOn: !showItemsWithNoStock,
                  },
                  {
                    text: buttonStrings.all_items_selected,
                    onPress: () => this.toggleSelectAllItems(isAllItemsSelected),
                    isOn: isAllItemsSelected,
                  },
                ]}
              />
            </View>
          </View>
          {this.renderDataTable()}
          <BottomModal
            isOpen={!(stocktake && stocktake.isFinalised) && (selection.length > 0)}
            style={localStyles.bottomModal}
          >
            <TextInput
              style={globalStyles.modalTextInput}
              textStyle={globalStyles.modalText}
              placeholderTextColor="white"
              placeholder={modalStrings.give_your_stocktake_a_name}
              value={this.state.stocktakeName}
              onChangeText={(text) => this.setState({ stocktakeName: text })}
            />
            <Button
              style={[globalStyles.button, globalStyles.modalOrangeButton]}
              textStyle={[globalStyles.buttonText, globalStyles.modalButtonText]}
              text={!stocktake ? modalStrings.create : modalStrings.confirm}
              onPress={this.onConfirmPress}
            />
          </BottomModal>
        </View>
      </View>
    );
  }
}

StocktakeManagePage.propTypes = {
  currentUser: React.PropTypes.object.isRequired,
  stocktake: React.PropTypes.object,
  database: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'code',
    width: 2,
    titleKey: 'item_code',
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'name',
    width: 6,
    titleKey: 'item_name',
    sortable: true,
  },
  {
    key: 'selected',
    width: 1,
    titleKey: 'selected',
    sortable: true,
    alignText: 'center',
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
