/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
} from 'react-native';

import { Button } from 'react-native-ui-components';
import { BottomModal, TextInput, ToggleBar } from '../../widgets';
import globalStyles from '../../globalStyles';
import { GenericPage } from '../GenericPage';
import { createRecord } from '../../database';
import { buttonStrings, modalStrings, generalStrings, tableStrings } from '../../localization';
import { formatDateAndTime } from '../../utilities';

const DATA_TYPES_SYNCHRONISED = ['Item', 'ItemBatch'];

/**
* Renders the page for managing a stocktake.
* @prop   {Realm}               database    App wide database.
* @prop   {func}                navigateTo  CallBack for navigation stack.
* @state  {Realm.Results}       items       Realm.Result object containing all Items.
*/
export class StocktakeManagePage extends React.Component {
  constructor(props) {
    super(props);
    this.items = props.database.objects('Item');
    this.state = {
      showItemsWithNoStock: true,
      stocktakeName: '',
      visibleItemIds: [],
      selection: [],
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'name',
      isAscending: true,
    };
  }

  componentWillMount = () => {
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
    }
  }

  onSelectionChange = (newSelection) => this.setState({ selection: newSelection });

  onConfirmPress = () => {
    this.props.runWithLoadingIndicator(() => {
      const { selection } = this.state;
      const { database, navigateTo, currentUser } = this.props;
      let { stocktake } = this.props;
      const { stocktakeName } = this.state;

      database.write(() => {
        // If no stocktake came in props, make a new one
        if (!stocktake) stocktake = createRecord(database, 'Stocktake', currentUser);

        stocktake.setItemsByID(database, selection);

        stocktake.name = stocktakeName !== '' ?
          stocktakeName :
          `${generalStrings.stocktake} ${formatDateAndTime(new Date(), 'slashes')}`;

        database.save('Stocktake', stocktake);
      });

      navigateTo(
        'stocktakeEditor',
        stocktake.name,
        { stocktake: stocktake },
        // Coming from StocktakesPage : coming from StocktakeEditPage.
        !this.props.stocktake ? 'replace' : 'goBack',
      );
    });
  }

  toggleSelectAllItems = (isAllItemsSelected) => {
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

  toggleShowItemsWithNoStock = () => {
    this.setState({
      showItemsWithNoStock: !this.state.showItemsWithNoStock,
    }, this.refreshData);
  }

  updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const { showItemsWithNoStock } = this.state;
    let data;
    data = this.items.filtered('name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0', searchTerm);
    data = data.sorted(sortBy, !isAscending);
    if (!showItemsWithNoStock) {
      data = data.slice().filter((item) => item.totalQuantity !== 0);
    }
    // Populate visibleItemIds with the ids of the items in the filtered data
    this.setState({
      visibleItemIds: data.map((item) => item.id),
      data: data,
    });
  }

  renderCell = (key, item) => {
    switch (key) {
      default:
        return item[key];
      case 'selected':
        return {
          type: 'checkable',
        };
    }
  }

  renderToggleBar = () => {
    const {
      visibleItemIds,
      showItemsWithNoStock,
      selection,
    } = this.state;
    const areAllItemsSelected = visibleItemIds.length > 0 &&
                                visibleItemIds.every((id) => selection.includes(id));
    return (
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
            onPress: () => this.toggleSelectAllItems(areAllItemsSelected),
            isOn: areAllItemsSelected,
          },
        ]}
      />
    );
  }

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopRightComponent={this.renderToggleBar}
        onSelectionChange={this.onSelectionChange}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'code',
            width: 2,
            title: tableStrings.item_code,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'name',
            width: 6,
            title: tableStrings.item_name,
            sortable: true,
          },
          {
            key: 'selected',
            width: 1,
            title: tableStrings.selected,
            alignText: 'center',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        database={this.props.database}
        selection={this.state.selection}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      >
        <BottomModal
          isOpen={!(this.props.stocktake && this.props.stocktake.isFinalised)
                                         && (this.state.selection.length > 0)}
          style={localStyles.bottomModal}
        >
          <TextInput
            style={globalStyles.modalTextInput}
            textStyle={globalStyles.modalText}
            underlineColorAndroid="transparent"
            placeholderTextColor="white"
            placeholder={modalStrings.give_your_stocktake_a_name}
            value={this.state.stocktakeName}
            onChangeText={(text) => this.setState({ stocktakeName: text })}
          />
          <Button
            style={[globalStyles.button, globalStyles.modalOrangeButton]}
            textStyle={[globalStyles.buttonText, globalStyles.modalButtonText]}
            text={!this.props.stocktake ? modalStrings.create : modalStrings.confirm}
            onPress={this.onConfirmPress}
          />
        </BottomModal>
      </GenericPage>
    );
  }
}

StocktakeManagePage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  stocktake: PropTypes.object,
  database: PropTypes.object.isRequired,
  navigateTo: PropTypes.func.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  bottomModal: {
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
});
