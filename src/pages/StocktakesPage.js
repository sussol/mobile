/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { SearchBar, Button, BottomConfirmModal, ToggleBar } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';

const DATA_TYPES_DISPLAYED = ['Stocktake'];

/**
* Renders the page for displaying Stocktakes.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only supplier_invoice.
*/
export class StocktakesPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.state.showCurrent = true;
    this.state.stocktakes = props.database.objects('Stocktake');
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
    this.onNewStockTake = this.onNewStockTake.bind(this);
    this.onDeleteConfirm = this.onDeleteConfirm.bind(this);
    this.onDeleteCancel = this.onDeleteCancel.bind(this);
    this.onToggleStatusFilter = this.onToggleStatusFilter.bind(this);
  }

  onRowPress(stocktake) {
    this.props.navigateTo(
      'stocktakeManager',
      `${stocktake.name}`,
      { stocktake: stocktake },
    );
  }

  onDeleteConfirm() {
    const { stocktakes, selection } = this.state;
    const { database } = this.props;
    database.write(() => {
      for (let i = 0; i < selection.length; i++) {
        const stocktake = stocktakes.find(s => s.id === selection[i]);
        if (stocktake.isValid()) database.delete('Stocktake', stocktake);
      }
    });
    this.setState({ selection: [] });
    this.refreshData();
  }

  onDeleteCancel() {
    this.setState({ selection: [] });
    this.refreshData();
  }

  onToggleStatusFilter(isCurrent) {
    this.setState({
      showCurrent: isCurrent,
    });
    this.refreshData();
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    const { stocktakes, showCurrent } = this.state;
    const toggleFilter = showCurrent ? 'status == "new"' : 'status != "new"';
    const data = stocktakes
                  .filtered(toggleFilter)
                  .sorted(sortBy, !isAscending); // 2nd arg: reverse sort order if true
    return data;
  }

  renderCell(key, stocktake) {
    switch (key) {
      default:
      case 'name':
        return stocktake.name;
      case 'createdDate':
        return stocktake.createdDate.toDateString();
      case 'status':
        return stocktake.status;
      case 'selected':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
        };
    }
  }

  renderSearchBar() {
    return (
      <SearchBar
        onChange={(event) => this.onSearchChange(event)}
        keyboardType="numeric"
      />);
  }

  render() {
    const { showCurrent } = this.state;
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <ToggleBar
              style={globalStyles.toggleBar}
              textOffStyle={globalStyles.toggleText}
              textOnStyle={globalStyles.toggleTextSelected}
              toggleOffStyle={globalStyles.toggleOption}
              toggleOnStyle={globalStyles.toggleOptionSelected}
              toggles={[
                {
                  text: 'Current',
                  onPress: () => this.onToggleStatusFilter(true),
                  isOn: showCurrent,
                },
                {
                  text: 'Past',
                  onPress: () => this.onToggleStatusFilter(false),
                  isOn: !showCurrent,
                },
              ]}
            />
            <View style={localStyles.buttonViewTop}>
              <Button
                style={globalStyles.button}
                textStyle={globalStyles.buttonText}
                text="New StockTake"
                onPress={() => this.props.navigateTo('stocktakeManager', 'New StockTake')}
              />
            </View>
          </View>
          {this.renderDataTable()}
        </View>
        <BottomConfirmModal
          isOpen={this.state.selection.length > 0}
          questionText="Are you sure you want to delete these stocktakes?"
          onCancel={() => this.onDeleteCancel()}
          onConfirm={() => this.onDeleteConfirm()}
          confirmText="Delete"
        />
      </View>
    );
  }
}

StocktakesPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'name',
    width: 6,
    title: 'NAME',
  },
  {
    key: 'createdDate',
    width: 2,
    title: 'CREATED DATE',
    sortable: true,
  },
  {
    key: 'status',
    width: 2,
    title: 'STATUS',
  },
  {
    key: 'selected',
    width: 1,
    title: 'DELETE',
  },
];

const localStyles = StyleSheet.create({
  buttonViewTop: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
