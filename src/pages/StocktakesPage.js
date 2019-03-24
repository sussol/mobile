/* eslint-disable indent */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GenericPage } from './GenericPage';

import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';
import { formatStatus } from '../utilities';
import { PageButton, BottomConfirmModal, ToggleBar } from '../widgets';
import { ByProgramModal } from '../widgets/modals/index';

import globalStyles from '../globalStyles';
import { createRecord } from '../database/utilities/index';

const DATA_TYPES_SYNCHRONISED = ['Stocktake'];

/**
 * Renders the page for displaying stocktakes.
 *
 * @prop  {Realm}         database    App wide database.
 * @prop  {func}          navigateTo  CallBack for navigation stack.
 * @state {Realm.Results} stocktakes  Result object containing all items.
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
      usesPrograms: false,
      byProgramModalOpen: false,
      isProgramStocktake: true,
      programValues: { program: {}, supplier: {}, orderType: {}, period: {}, name: '' },
    };
    this.stocktakes = props.database.objects('Stocktake');
  }

  componentDidMount() {
    const { database, settings } = this.props;
    const tags = settings.get('ThisStoreTags');
    const usesPrograms = database
      .objects('MasterList')
      .filtered('isProgram = $0', true)
      .find(masterList => masterList.canUseProgram(tags));
    this.setState({ usesPrograms: !!usesPrograms });
  }

  onConfirmProgramStocktake = () => {
    const { runWithLoadingIndicator } = this.props;

    runWithLoadingIndicator(() => {
      const { currentUser, database, navigateTo } = this.props;
      const { programValues } = this.state;
      const { program } = programValues;

      programValues.createdBy = currentUser;
      let stocktake;
      database.write(() => {
        stocktake = createRecord(database, 'ProgramStocktake', programValues);
        stocktake.setItemsByID(
          database,
          program.items.map(masterListItem => masterListItem.item.id)
        );
      });

      this.setState(
        {
          byProgramModalOpen: false,
          programValues: { program: {}, supplier: {}, orderType: {}, period: {}, name: '' },
        },
        () => navigateTo('stocktakeEditor', navStrings.stocktake, { stocktake })
      );
    });
  };

  onRowPress = stocktake => {
    const { navigateTo } = this.props;

    this.clearSelection();
    navigateTo('stocktakeEditor', navStrings.stocktake, {
      stocktake,
    });
  };

  onNewStockTake = () => {
    const { navigateTo } = this.props;
    const { usesPrograms, isProgramStocktake } = this.state;
    this.clearSelection();

    if (!usesPrograms || (usesPrograms && !isProgramStocktake)) {
      navigateTo('stocktakeManager', navStrings.new_stocktake);
    } else {
      this.setState({ byProgramModalOpen: true });
    }
  };

  onDeleteConfirm = () => {
    const { selection } = this.state;
    const { database } = this.props;
    database.write(() => {
      const stocktakesToDelete = [];
      for (let i = 0; i < selection.length; i += 1) {
        const stocktake = this.stocktakes.find(s => s.id === selection[i]);
        if (stocktake.isValid() && !stocktake.isFinalised) {
          stocktakesToDelete.push(stocktake);
        }
      }
      database.delete('Stocktake', stocktakesToDelete);
    });
    this.clearSelection(true);
  };

  onToggleStatusFilter = isCurrent => {
    this.setState({ showCurrent: isCurrent }, this.refreshData);
  };

  onSelectionChange = newSelection => {
    this.setState({ selection: newSelection });
  };

  clearSelection = shouldRefreshData => {
    this.setState({ selection: [] }, () => shouldRefreshData && this.refreshData());
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
    const { showCurrent } = this.state;

    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const toggleFilter = showCurrent ? 'status != "finalised"' : 'status == "finalised"';
    const data = this.stocktakes
      .filtered(toggleFilter)
      .filtered('name BEGINSWITH[c] $0 OR serialNumber BEGINSWITH[c] $0', searchTerm)
      .sorted(sortBy, !isAscending); // |!isAscending| reverses sort order if |isAscending| is true.
    this.setState({ data });
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

  renderToggleBar = () => {
    const { showCurrent } = this.state;

    return (
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
    );
  };

  programValuesSetter = ({ key, item }) => {
    const { programValues } = this.state;
    let newProgramValues;
    if (key === 'name') {
      newProgramValues = {
        ...programValues,
        name: item,
      };
    }
    if (key === 'program') {
      newProgramValues = {
        supplier: {},
        period: {},
        orderType: {},
        program: item,
      };
    }

    this.setState({ programValues: newProgramValues });
  };

  onOrderToggle = () => {
    const { isProgramStocktake } = this.state;
    this.setState({
      isProgramStocktake: !isProgramStocktake,
      programValues: { program: {}, supplier: {}, orderType: {}, period: {} },
    });
  };

  onCancelByProgram = () => {
    this.setState({
      byProgramModalOpen: false,
      programValues: { program: {}, supplier: {}, orderType: {}, period: {}, name: '' },
    });
  };

  renderNewStocktakeButton = () => (
    <PageButton text={buttonStrings.new_stocktake} onPress={this.onNewStockTake} />
  );

  render() {
    const { database, genericTablePageStyles, topRoute, settings } = this.props;
    const {
      data,
      selection,
      showCurrent,
      byProgramModalOpen,
      programValues,
      isProgramStocktake,
    } = this.state;
    return (
      <GenericPage
        data={data}
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
        database={database}
        selection={selection}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        <BottomConfirmModal
          isOpen={selection.length > 0 && showCurrent}
          questionText={modalStrings.delete_these_stocktakes}
          onCancel={() => this.clearSelection(true)}
          onConfirm={() => this.onDeleteConfirm()}
          confirmText={modalStrings.delete}
        />
        <ByProgramModal
          isOpen={byProgramModalOpen}
          onConfirm={
            isProgramStocktake
              ? this.onConfirmProgramStocktake
              : () => this.setState({ byProgramModalOpen: false }, this.onNewStockTake())
          }
          onCancel={this.onCancelByProgram}
          onToggleChange={this.onOrderToggle}
          database={database}
          valueSetter={this.programValuesSetter}
          programValues={programValues}
          type="stocktake"
          settings={settings}
          isProgramBased={isProgramStocktake}
          name={programValues.name}
        />
      </GenericPage>
    );
  }
}

export default StocktakesPage;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
StocktakesPage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
};
