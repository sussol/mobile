import React from 'react';
import PropTypes from 'prop-types';
import { ToggleBar } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericPage } from './GenericPage';
import { tableStrings } from '../localization';
import { sortDataBy } from '../utilities';
import { ConsumptionReportExpansion } from './expansions/ConsumptionReportExpansion';

const REPORT_PERIOD_TYPES = { MONTHLY: 1, QUARTERLY: 4 };
const NUMBER_OF_REPORT_PERIODS = 4;

const getNextPeriodType = (currentPeriodType) => {
  // Default period is Monthly
  if (!currentPeriodType || currentPeriodType === REPORT_PERIOD_TYPES.QUARTERLY) {
    return REPORT_PERIOD_TYPES.MONTHLY;
  }
  return REPORT_PERIOD_TYPES.QUARTERLY;
};

const getNameForPeriod = (period) => {
  if (period === REPORT_PERIOD_TYPES.MONTHLY) return 'Monthly'; // TODO Localise
  return 'Quarterly'; // TODO Localise
};

// ******** REPORT HELPERS
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
/**
 * Formats date
 * @param  {Date} date  date to format
 * @return {String} formated date (e.g 1 April 2017)
**/
const formatDate = (date) =>
  `${date.getDate()} ${monthNames[date.getMonth()]} ${String(date.getYear()).slice(-2)}`;

/**
 * Generates an array of periods
 * @constant NUMER_OF_PERIODS, set number of periods in generated array
 * @param  {Number} numberOfMonthInPeriod
 * @return {Array} An array of periods e.g. (forNumberOfMonthInPeriod = 1)
[ { fromDate: Tue Aug 01 2017 20:30:17 GMT-0400 (EDT)),
    toDate: Fri Sep 01 2017 20:30:17 GMT-0400 (EDT),
    formatedDate: '1 August 17 -\n31 August 17' },
  { fromDate: Fri Sep 01 2017 20:30:17 GMT-0400 (EDT),
    toDate: Sun Oct 01 2017 20:30:17 GMT-0400 (EDT),
    formatedDate: '1 September 17 -\n30 September 17' },
  { fromDate: Sun Oct 01 2017 20:30:17 GMT-0400 (EDT),
    toDate: Wed Nov 01 2017 20:30:17 GMT-0400 (EDT),
    formatedDate: '1 October 17 -\n31 October 17' },
  { fromDate: Wed Nov 01 2017 20:30:17 GMT-0400 (EDT),
    toDate: Wed Nov 22 2017 20:30:17 GMT-0500 (EST),
    formatedDate: '1 November 17 -\n21 November 17' } ]
**/
const createReportRanges = (numberOfMonthInPeriod) => {
  const returnArray = [];
  let toDate = new Date();
  for (let i = 0; i < NUMBER_OF_REPORT_PERIODS; i++) {
    const fromDate = new Date(toDate.getTime());
    // If current date is not the start of the month
    // pretend that it is the start of next month
    if (i === 0 && toDate.getDate() !== 1) {
      fromDate.setMonth(fromDate.getMonth() + 1);
      fromDate.setDate(1);
      // toDate and fromDate in search should be inclusive (check out constructSearchString)
    } else toDate.setDate(toDate.getDate() - 1);
    fromDate.setMonth(fromDate.getMonth() - numberOfMonthInPeriod);
    const formatedDate = `${formatDate(fromDate)} -${'\n'}${formatDate(toDate)}`;

    returnArray.push({ fromDate, toDate, formatedDate });
    toDate = fromDate;
  }
  return returnArray.reverse();
};
/**
 * Generates realm searchStrings (for TransactionBatch)
 * @param  {String} searchTerm  itemName filter
 * @param  {String} itemId [optional]  itemId filter
 * @return {String} A search string in format:
  'transaction.type = "customer_invoice" AND transaction.status = "finalised" \
  AND itemName BEGINSWITH[c] $0 AND transaction.confirmDate >= $1 \
  AND transaction.confirmDate <= $2 [AND itemId = $3]`
**/
const constructSearchString = (searchTerm, itemId) => {
  let searchString = '';

  searchString += 'transaction.type = "customer_invoice"';
  searchString += ' AND transaction.status = "finalised"';
  searchString += ' AND itemName BEGINSWITH[c] $0';
  searchString += ' AND transaction.confirmDate >= $1 AND transaction.confirmDate <= $2';

  if (itemId) searchString += ' AND itemId = $3';
  return searchString;
};
/**
 * Generates an array to be displayed in data table
 * @param  {String} searchTerm  itemName filter
 * @param  {Realm} database
 * @param  {Array} dateRanges array, as per createReportRanges
 * @param  {String} itemId [optional]  itemId filter
 * @return {Array} And array in two formats:
   - if itemId is not present and searchTerm is 'Amox'
   [ { '1 August 17 -\n31 August 17': 470,
        '1 September 17 -\n30 September 17': 679,
        '1 October 17 -\n31 October 17': 0,
        '1 November 17 -\n22 November 17': 900,
        itemId: 'C0A6A6DEE54B2D4BBDBC08E213D73B24',
        id: 'C0A6A6DEE54B2D4BBDBC08E213D73B24',
        itemName: 'Amoxicillin 500mg tabs' },
      { '1 August 17 -\n31 August 17': 33,
        '1 September 17 -\n30 September 17': 34,
        '1 October 17 -\n31 October 17': 0,
        '1 November 17 -\n22 November 17': 0,
        itemId: '8D7F8921942D5245A0ACC1ED058BBD63',
        id: '8D7F8921942D5245A0ACC1ED058BBD63',
        itemName: 'Amoxicillin Dry Powder for Suspension 125mg/5ml Bot/100ml' } ]
    - if itemId is 'C0A6A6DEE54B2D4BBDBC08E213D73B24' i.e Amoxicillin 500mg
      ( breakdown by customer )
    [ { '1 August 17 -\n31 August 17': 470,
         '1 September 17 -\n30 September 17': 679,
         '1 October 17 -\n31 October 17': 0,
         '1 November 17 -\n22 November 17': 0,
         customerName: 'Patient' },
       { '1 August 17 -\n31 August 17': 0,
         '1 September 17 -\n30 September 17': 0,
         '1 October 17 -\n31 October 17': 0,
         '1 November 17 -\n22 November 17': 600,
         customerName: 'Liquica Villa CHC' },
       { '1 August 17 -\n31 August 17': 0,
         '1 September 17 -\n30 September 17': 0,
         '1 October 17 -\n31 October 17': 0,
         '1 November 17 -\n22 November 17': 300,
         customerName: 'General (SAMES)' } ]
**/
const produceReport = (searchTerm, database, dateRanges, itemId) => {
  const data = {};
  const returnArray = [];
  const sampleRow = {};
  const searchString = constructSearchString(searchTerm, itemId);
  dateRanges.forEach(dateRange => {
    const columnKey = dateRange.formatedDate;
    sampleRow[columnKey] = 0;
  });

  dateRanges.forEach(dateRange => {
    const transactionBatches = database.objects('TransactionBatch').filtered(
      searchString, searchTerm, dateRange.fromDate, dateRange.toDate, itemId);

    const columnKey = dateRange.formatedDate;
    transactionBatches.forEach(transactionBatch => {
      // For expansion table data (for one item), group by customer
      if (itemId) {
        const rowKey = transactionBatch.transaction.otherParty.id;
        if (!data[rowKey]) {
          data[rowKey] = {
            ...sampleRow,
            customerName: transactionBatch.transaction.otherParty.name,
          };
        }
        data[rowKey][columnKey]
          += transactionBatch.packSize * transactionBatch.numberOfPacks;
      } else {  // For main table data (all items), group by itemId
        const rowKey = transactionBatch.itemId;
        if (!data[rowKey]) {
          data[rowKey] = {
            ...sampleRow,
            itemId: transactionBatch.itemId,
            // Id is for generic-data-table-page expansions (it keeps track of
            // expanded rows by id)
            id: transactionBatch.itemId,
            itemName: transactionBatch.itemName,
          };
        }
        data[rowKey][columnKey]
          += transactionBatch.packSize * transactionBatch.numberOfPacks;
      }
    });
  });
  // Turn to array
  Object.keys(data).forEach(dataKey => (
    returnArray.push({ ...data[dataKey] })
  ));
  return returnArray;
};
// ******** REPORT HELPERS ENDS

export class ConsumptionReportPage extends React.Component {
  constructor(props) {
    super(props);
    const currentPeriodType = getNextPeriodType();
    this.dateRanges = createReportRanges(currentPeriodType);
    this.shouldRefetchData = true;
    this.state = {
      currentPeriodType,
      columns: this.getColumns(),
      data: [],
    };
    this.setDefaultDataFilters();
  }

  onTogglePeriod = () => {
    const currentPeriodType = getNextPeriodType(this.state.currentPeriodType);
    this.dateRanges = createReportRanges(currentPeriodType);
    this.shouldRefetchData = true;
    this.setDefaultDataFilters();
    this.setState({
      currentPeriodType,
      columns: this.getColumns(), // Columns need to update dynamicly so moving them to state
    }, this.refreshData());
  }

  setDefaultDataFilters = () => {
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'itemName',
      isAscending: true,
    };
  }

  getColumns = () => (
    [
      {
        key: 'itemName',
        width: 3,
        title: tableStrings.name,
        sortable: true,
      },
      ...this.dateRanges.map((dateRange) => ({
        key: dateRange.formatedDate,
        width: 2,
        title: dateRange.formatedDate,
        sortable: true,
      })),
    ]
  )

  updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSearchTerm != null && this.dataFilters.searchTerm !== newSearchTerm) {
      this.dataFilters.searchTerm = newSearchTerm;
      this.shouldRefetchData = true;
    }
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  }

  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    let data = this.state.data;
    if (this.shouldRefetchData) {
      data = produceReport(searchTerm, this.props.database, this.dateRanges);
      this.shouldRefetchData = false;
    }

    let sortDataType;
    switch (sortBy) {
      case 'itemName':
        sortDataType = 'string';
        break;
      default:
        sortDataType = 'number';
    }

    data = sortDataBy(data, sortBy, sortDataType, isAscending);
    this.setState({ data });
  }

  renderCell = (key, dataRow) => dataRow[key]

  renderExpansion = (item) => {
    const { searchTerm } = this.dataFilters;
    const data = produceReport(searchTerm, this.props.database, this.dateRanges, item.itemId);
    return (
      <ConsumptionReportExpansion
        data={data}
        dateRanges={this.dateRanges}
        database={this.props.database}
        genericTablePageStyles={this.props.genericTablePageStyles}
        refreshParent={this.refreshData}
      />
    );
  }

  renderToggleBar = () => (
    <ToggleBar
      style={globalStyles.toggleBar}
      textOffStyle={globalStyles.toggleText}
      textOnStyle={globalStyles.toggleTextSelected}
      toggleOffStyle={globalStyles.toggleOption}
      toggleOnStyle={globalStyles.toggleOptionSelected}
      toggles={[
        {
          text: getNameForPeriod(REPORT_PERIOD_TYPES.MONTHLY),
          onPress: this.onTogglePeriod,
          isOn: this.state.currentPeriodType === REPORT_PERIOD_TYPES.MONTHLY,
        },
        {
          text: getNameForPeriod(REPORT_PERIOD_TYPES.QUARTERLY),
          onPress: this.onTogglePeriod,
          isOn: this.state.currentPeriodType === REPORT_PERIOD_TYPES.QUARTERLY,
        },
      ]}
    />
  )

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
        columns={this.state.columns}
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
