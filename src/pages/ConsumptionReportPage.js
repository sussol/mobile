/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';

import { PageButton, ToggleBar, PageInfo } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericPage } from './GenericPage';
import { Expansion } from 'react-native-data-table';
import { formatStatus } from '../utilities';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';
import { ConsumptionReportExpansion } from './expansions/ConsumptionReportExpansion'

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const formatDate = (date) => {
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${String(date.getYear()).slice(-2)}`;
}

const createReportRanges = (numberOfPeriods, numberOfMonthInPeriod) => {
  const returnArray = [];
  let toDate = new Date();
  for (let i = 0; i < numberOfPeriods; i++) {
    const fromDate = new Date(toDate.getTime());
    if (!i && toDate.getDate() !== 1) {
      fromDate.setMonth(fromDate.getMonth() + 1);
      fromDate.setDate(1);
    }
    fromDate.setMonth(fromDate.getMonth() - numberOfMonthInPeriod);
    returnArray.push({
      fromDate,
      toDate,
      header: `${formatDate(fromDate)} -${'\n'}${formatDate(toDate)}`,
    });
    toDate = fromDate;
  }
  return returnArray.reverse();
};


/**
* Renders the page for displaying Stocktakes.
* @prop   {Realm}               database    App wide database.
* @prop   {func}                navigateTo  CallBack for navigation stack.
* @state  {Realm.Results}       stocktakes  Realm.Result object containing all Items.
*/
export class ConsumptionReportPage extends React.Component {
  constructor(props) {
    super(props);
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'createdDate',
      isAscending: false,
    };
    this.state = { data: [], isMonthly: true, dateRanges: createReportRanges(4, 1)
    };
    this.stocktakes = props.database.objects('Stocktake');
    autobind(this);
  }

  onToggleStatusFilter(isCurrent) {
    this.setState({
      showCurrent: isCurrent,
    }, this.refreshData);
  }



  updateDataFilters(newSearchTerm, newSortBy, newIsAscending) {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */

  renderCell(key, dataRow) {
    switch (key) {
      default:
        return dataRow[key];
    }
  }

  onTogglePeriod() {
    this.setState({ isMonthly: !this.state.isMonthly,
                    dateRanges: createReportRanges(4, !this.state.isMonthly ? 1 : 4) },
                  this.refreshData());
  }

  renderToggleBar() {
    return (
      <ToggleBar
        style={globalStyles.toggleBar}
        textOffStyle={globalStyles.toggleText}
        textOnStyle={globalStyles.toggleTextSelected}
        toggleOffStyle={globalStyles.toggleOption}
        toggleOnStyle={globalStyles.toggleOptionSelected}
        toggles={[
          {
            text: 'Monthly', // TODO: Localist
            onPress: () => {  },
            isOn: this.state.isMonthly,
          },
          {
            text: 'Quarterly',
            onPress: () => {  },
            isOn: !this.state.isMonthly,
          },
        ]}
      />
    );
  }

  produceReport(byItem, filterItemName) {
    const { database } = this.props;
    const data = {};
    const resultRows = [];
    const sampleRow = {};
    let searchString = '';

    searchString += 'transaction.type = "customer_invoice"';
    searchString += ' AND transaction.status = "finalised"';
    searchString += ' AND transaction.confirmDate >= $0 AND transaction.confirmDate < $1';

    if (filterItemName) searchString += ' AND itemId = $2';

    for (let count = 0; count < this.state.dateRanges.length; count++) {
      sampleRow[count] = 0;
    }
    console.log(this.state.dateRanges);
    this.state.dateRanges.forEach((dateRange, index) => {
      const transactionBatches = database.objects('TransactionBatch').filtered(
        searchString, dateRange.fromDate, dateRange.toDate, filterItemName);

      transactionBatches.forEach(transactionBatch => {
        if (byItem) {
          if (!data[transactionBatch.itemId]) {
            data[transactionBatch.itemId] = { ...sampleRow,
                                              itemId: transactionBatch.itemId,
                                              itemName: transactionBatch.itemName };
          }
          data[transactionBatch.itemId][index]
            += transactionBatch.packSize * transactionBatch.numberOfPacks;
        } else {
          if (!data[transactionBatch.transaction.otherParty.id]) {
            data[transactionBatch.transaction.otherParty.id] = {
              ...sampleRow,
              customerName: transactionBatch.transaction.otherParty.name,
            };
          }
          data[transactionBatch.transaction.otherParty.id][index]
            += transactionBatch.packSize * transactionBatch.numberOfPacks;
        }
      });
    });

    Object.keys(data).forEach(key => {
      resultRows.push({
        ...data[key],
      });
    });

    return resultRows;
  }

  refreshData(newSearchTerm, newSortBy, newIsAscending) {
    console.log('refreshing');
    this.setState({ data: this.produceReport(true) });
  }

  renderExpansion(item) {
    return (
      <ConsumptionReportExpansion
        data={this.produceReport(false, item.itemId)}
        database={this.props.database}
        genericTablePageStyles={this.props.genericTablePageStyles}
        refreshParent={this.refreshData}
      />
  )
  }

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderExpansion={this.renderExpansion}
        renderTopRightComponent={this.renderToggleBar}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'itemName',
            width: 3,
            title: tableStrings.name,
          },
          ...this.state.dateRanges.map((dateRange, index) => ({
            key: index,
            width: 2,
            title: dateRange.header,
            alignText: 'center',
          })),
        ]}
        database={this.props.database}
        selection={this.state.selection}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      />
    );
  }
}

ConsumptionReportPage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
};
