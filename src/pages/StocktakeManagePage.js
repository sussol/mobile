/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet } from 'react-native';

import { GenericPage } from './GenericPage';
import { BottomModal, OnePressButton, TextInput, ToggleBar } from '../widgets';

import { createRecord } from '../database';

import { buttonStrings, modalStrings, tableStrings, navStrings } from '../localization';
import globalStyles from '../globalStyles';

const DATA_TYPES_SYNCHRONISED = ['Item', 'ItemBatch'];

/**
 * Renders the page for managing a stocktake.
 *
 * @prop  {Realm}         database    App wide database.
 * @prop  {func}          navigateTo  CallBack for navigation stack.
 * @state {Realm.Results} items       Realm.Result object containing all items.
 */
export class StocktakeManagePage extends React.Component {
  constructor(props) {
    super(props);
    this.items = props.database.objects('Item').filtered('crossReferenceItem == null');
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
    const { stocktake, stocktakeName } = this.props;

    if (stocktakeName) {
      this.setState({ stocktakeName });
    }

    if (stocktake) {
      const selected = [];
      stocktake.items.forEach(stocktakeItem => {
        const { itemId } = stocktakeItem;
        if (itemId !== '') selected.push(itemId);
      });

      this.setState(
        {
          selection: selected,
          stocktakeName: stocktake.name,
        },
        this.refreshData
      );
    }
  };

  onSelectionChange = newSelection => this.setState({ selection: newSelection });

  onConfirmPress = () => {
    const { runWithLoadingIndicator } = this.props;

    runWithLoadingIndicator(() => {
      const { currentUser, database, navigateTo } = this.props;
      const { selection, stocktakeName } = this.state;

      let { stocktake } = this.props;
      database.write(() => {
        // If no |stocktake| came in props, make a new one.
        if (!stocktake) {
          stocktake = createRecord(database, 'Stocktake', currentUser, stocktakeName);
        }

        stocktake.setItemsByID(database, selection);

        database.save('Stocktake', stocktake);
      });

      navigateTo(
        'stocktakeEditor',
        navStrings.stocktake,
        { stocktake },
        // Coming from |StocktakesPage| : coming from |StocktakeEditPage|.
        !stocktake ? 'replace' : 'goBack'
      );
    });
  };

  toggleSelectAllItems = isAllItemsSelected => {
    const { visibleItemIds, selection } = this.state;

    if (isAllItemsSelected) {
      // Deselect all visible items.
      visibleItemIds.forEach(id => {
        const idIndex = selection.indexOf(id);
        if (idIndex >= 0) {
          selection.splice(idIndex, 1);
        }
      });
    } else {
      // Add all |id|s in |visibleItemIds| that aren't already in selection.
      visibleItemIds.forEach(id => {
        if (!selection.includes(id)) {
          selection.push(id);
        }
      });
    }

    this.setState(
      {
        selection: [...selection],
      },
      this.refreshData
    );
  };

  toggleShowItemsWithNoStock = () => {
    const { showItemsWithNoStock } = this.state;

    this.setState(
      {
        showItemsWithNoStock: !showItemsWithNoStock,
      },
      this.refreshData
    );
  };

  updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // (... != null) checks for null or undefined (implicitly type coerced to null).
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  };

  /**
   * Returns updated data filtered by |searchTerm| and ordered by |sortBy| and |isAscending|.
   */
  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const { showItemsWithNoStock } = this.state;
    let data;
    data = this.items.filtered('name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0', searchTerm);
    data = data.sorted(sortBy, !isAscending);
    if (!showItemsWithNoStock) {
      data = data.slice().filter(item => item.totalQuantity !== 0);
    }
    // Populate |visibleItemIds| with the ids of the items in the filtered data.
    this.setState({
      visibleItemIds: data.map(item => item.id),
      data,
    });
  };

  renderCell = (key, item) => {
    switch (key) {
      default:
        return item[key];
      case 'selected':
        return {
          type: 'checkable',
        };
    }
  };

  renderToggleBar = () => {
    const { visibleItemIds, showItemsWithNoStock, selection } = this.state;
    const areAllItemsSelected =
      visibleItemIds.length > 0 && visibleItemIds.every(id => selection.includes(id));
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
  };

  render() {
    const { database, genericTablePageStyles, stocktake, topRoute } = this.props;
    const { data, selection, stocktakeName } = this.state;

    return (
      <GenericPage
        data={data}
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
        database={database}
        selection={selection}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        <BottomModal
          isOpen={!(stocktake && stocktake.isFinalised) && selection.length > 0}
          style={localStyles.bottomModal}
        >
          <TextInput
            style={globalStyles.modalTextInput}
            textStyle={globalStyles.modalText}
            underlineColorAndroid="transparent"
            placeholderTextColor="white"
            placeholder={modalStrings.give_your_stocktake_a_name}
            value={stocktakeName}
            onChangeText={text => this.setState({ stocktakeName: text })}
          />
          <OnePressButton
            style={[globalStyles.button, globalStyles.modalOrangeButton]}
            textStyle={[globalStyles.buttonText, globalStyles.modalButtonText]}
            text={!stocktake ? modalStrings.create : modalStrings.confirm}
            onPress={this.onConfirmPress}
          />
        </BottomModal>
      </GenericPage>
    );
  }
}

export default StocktakeManagePage;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
StocktakeManagePage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  stocktake: PropTypes.object,
  database: PropTypes.object.isRequired,
  navigateTo: PropTypes.func.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  stocktakeName: PropTypes.string,
};

const localStyles = StyleSheet.create({
  bottomModal: {
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
});
