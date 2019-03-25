/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';

import { PageButton, BottomConfirmModal, ToggleBar } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericPage } from './GenericPage';
import { formatStatus } from '../utilities';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Stocktake'];

/**
 * Renders the page for displaying Stocktakes.
 * @prop   {Realm}               database    App wide database.
 * @prop   {func}                navigateTo  CallBack for navigation stack.
 * @state  {Realm.Results}       stocktakes  Realm.Result object containing all Items.
 */
export class StocktakesPage extends React.Component {
  constructor(props) {
    super(props);
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'createdDate',
      isAscending: false,
    };
    this.state = {
      showCurrent: true,
      selection: [],
    };
    this.stocktakes = props.database.objects('Stocktake');
  }

  onRowPress = stocktake => {
    this.clearSelection();
    this.props.navigateTo('stocktakeEditor', navStrings.stocktake, { stocktake: stocktake });
  };

  onNewStockTake = () => {
    this.clearSelection();
    this.props.navigateTo('stocktakeManager', navStrings.new_stocktake);
  };

  onDeleteConfirm = () => {
    const { selection } = this.state;
    const { database } = this.props;
    database.write(() => {
      const stocktakesToDelete = [];
      for (let i = 0; i < selection.length; i++) {
        const stocktake = this.stocktakes.find(s => s.id === selection[i]);
        if (stocktake.isValid() && !stocktake.isFinalised) stocktakesToDelete.push(stocktake);
      }
      database.delete('Stocktake', stocktakesToDelete);
    });
    this.clearSelection(true);
  };

  onToggleStatusFilter = isCurrent => this.setState({ showCurrent: isCurrent }, this.refreshData);

  onSelectionChange = newSelection => this.setState({ selection: newSelection });

  clearSelection = shouldRefreshData =>
    this.setState({ selection: [] }, () => shouldRefreshData && this.refreshData());

  updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  };

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const toggleFilter = this.state.showCurrent ? 'status != "finalised"' : 'status == "finalised"';
    const data = this.stocktakes
      .filtered(toggleFilter)
      .filtered('name BEGINSWITH[c] $0 OR serialNumber BEGINSWITH[c] $0', searchTerm)
      .sorted(sortBy, !isAscending); // 2nd arg: reverse sort order if true
    this.setState({ data: data });
  };

  renderCell = (key, stocktake) => {
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
  };

  renderToggleBar = () => (
    <ToggleBar
      style={globalStyles.toggleBar}
      textOffStyle={globalStyles.toggleText}
      textOnStyle={globalStyles.toggleTextSelected}
      toggleOffStyle={globalStyles.toggleOption}
      toggleOnStyle={globalStyles.toggleOptionSelected}
      toggles={[
        {
          text: 'CURRENT',
          onPress: () => this.onToggleStatusFilter(true),
          isOn: this.state.showCurrent,
        },
        {
          text: 'HISTORIC',
          onPress: () => this.onToggleStatusFilter(false),
          isOn: !this.state.showCurrent,
        },
      ]}
    />
  );

  renderNewStocktakeButton = () => (
    <PageButton text={buttonStrings.new_stocktake} onPress={this.onNewStockTake} />
  );

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopLeftComponent={this.renderToggleBar}
        renderTopRightComponent={this.renderNewStocktakeButton}
        onRowPress={this.onRowPress}
        onSelectionChange={this.onSelectionChange}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'name',
            width: 6,
            title: tableStrings.name,
          },
          {
            key: 'createdDate',
            width: 2,
            title: tableStrings.created_date,
            sortable: true,
          },
          {
            key: 'status',
            width: 2,
            title: tableStrings.status,
            sortable: true,
          },
          {
            key: 'selected',
            width: 1,
            title: tableStrings.delete,
            alignText: 'center',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        database={this.props.database}
        selection={this.state.selection}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      >
        <BottomConfirmModal
          isOpen={this.state.selection.length > 0 && this.state.showCurrent}
          questionText={modalStrings.delete_these_stocktakes}
          onCancel={() => this.clearSelection(true)}
          onConfirm={() => this.onDeleteConfirm()}
          confirmText={modalStrings.delete}
        />
      </GenericPage>
    );
  }
}

StocktakesPage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
};
