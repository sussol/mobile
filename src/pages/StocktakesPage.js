/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { PageButton, BottomConfirmModal, ToggleBar } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';
import { formatStatus } from '../utilities';
import { buttonStrings, modalStrings, navStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Stocktake'];

/**
* Renders the page for displaying Stocktakes.
* @prop   {Realm}               database    App wide database.
* @prop   {func}                navigateTo  CallBack for navigation stack.
* @state  {Realm.Results}       stocktakes  Realm.Result object containing all Items.
*/
export class StocktakesPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'createdDate';
    this.state.isAscending = false;
    this.state.showCurrent = true;
    this.state.stocktakes = props.database.objects('Stocktake');
    this.columns = COLUMNS;
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
    this.onNewStockTake = this.onNewStockTake.bind(this);
    this.onDeleteConfirm = this.onDeleteConfirm.bind(this);
    this.onDeleteCancel = this.onDeleteCancel.bind(this);
    this.onToggleStatusFilter = this.onToggleStatusFilter.bind(this);
  }

  onRowPress(stocktake) {
    this.props.navigateTo(
      'stocktakeEditor',
      `${stocktake.name}`,
      { stocktake: stocktake },
    );
  }

  onNewStockTake() {
    this.props.navigateTo('stocktakeManager', navStrings.new_stocktake);
  }

  onDeleteConfirm() {
    const { stocktakes, selection } = this.state;
    const { database } = this.props;
    database.write(() => {
      const stocktakesToDelete = [];
      for (let i = 0; i < selection.length; i++) {
        const stocktake = stocktakes.find(s => s.id === selection[i]);
        if (stocktake.isValid() && !stocktake.isFinalised) stocktakesToDelete.push(stocktake);
      }
      database.delete('Stocktake', stocktakesToDelete);
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
    }, this.refreshData);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    const { stocktakes, showCurrent } = this.state;
    const toggleFilter = showCurrent ? 'status != "finalised"' : 'status == "finalised"';
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
        return formatStatus(stocktake.status);
      case 'selected':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: stocktake.isFinalised,
        };
    }
  }

  render() {
    const { showCurrent, selection } = this.state;
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
                  text: buttonStrings.current,
                  onPress: () => this.onToggleStatusFilter(true),
                  isOn: showCurrent,
                },
                {
                  text: buttonStrings.past,
                  onPress: () => this.onToggleStatusFilter(false),
                  isOn: !showCurrent,
                },
              ]}
            />
            <View style={localStyles.buttonViewTop}>
              <PageButton
                text={buttonStrings.new_stocktake}
                onPress={this.onNewStockTake}
              />
            </View>
          </View>
          {this.renderDataTable()}
          <BottomConfirmModal
            isOpen={selection.length > 0 && showCurrent}
            questionText={modalStrings.delete_these_stocktakes}
            onCancel={() => this.onDeleteCancel()}
            onConfirm={() => this.onDeleteConfirm()}
            confirmText={modalStrings.delete}
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

const COLUMNS = [
  {
    key: 'name',
    width: 6,
    titleKey: 'name',
  },
  {
    key: 'createdDate',
    width: 2,
    titleKey: 'created_date',
    sortable: true,
  },
  {
    key: 'status',
    width: 2,
    titleKey: 'status',
    sortable: true,
  },
  {
    key: 'selected',
    width: 1,
    titleKey: 'delete',
    alignText: 'center',
  },
];

const localStyles = StyleSheet.create({
  buttonViewTop: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
