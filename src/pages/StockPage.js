/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Expansion } from 'react-native-data-table';

import { GenericPage } from './GenericPage';

import { tableStrings } from '../localization';
import { formatExpiryDate, sortDataBy } from '../utilities';
import { PageInfo } from '../widgets';

import { dataTableStyles } from '../globalStyles';

const DATA_TYPES_SYNCHRONISED = ['Item', 'ItemBatch', 'ItemCategory'];

/**
 * Renders the page for all Items and their stock, with expansion of further details.
 * @prop   {Realm}          database    App wide database.
 * @prop   {func}           navigateTo  CallBack for navigation stack.
 * @state  {Realm.Results}  items       Contains all items stored in the local database.
 */
export class StockPage extends React.Component {
  constructor(props) {
    super(props);

    const { database } = props;

    this.state = {
      items: database.objects('Item').filtered('crossReferenceItem == null'),
    };

    this.dataFilters = {
      searchTerm: '',
      sortBy: 'name',
      isAscending: true,
    };
  }

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
    const { items } = this.state;

    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const data = items.filtered('name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0', searchTerm);

    let sortDataType;
    switch (sortBy) {
      case 'totalQuantity':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({
      data: sortDataBy(data, sortBy, sortDataType, isAscending),
    });
  };

  renderCell = (key, item) => item[key];

  renderExpansion = item => {
    const batchInfo = item.batchesWithStock.map(ItemBatch => {
      const quantityInfo = `  ${tableStrings.quantity}: ${ItemBatch.numberOfPacks}`;
      const expiryInfo = ItemBatch.expiryDate
        ? `  ${tableStrings.batch_expiry}: ${formatExpiryDate(ItemBatch.expiryDate)},`
        : '';
      const nameInfo = ItemBatch.batch ? `  ${ItemBatch.batch},` : '';

      return {
        title: `${tableStrings.batch}:`,
        info: `${nameInfo}${expiryInfo}${quantityInfo}`,
      };
    });

    const { dailyUsage } = item;
    const infoColumns = [
      [
        {
          title: `${tableStrings.category}:`,
          info: item.categoryName,
        },
        {
          title: `${tableStrings.department}:`,
          info: item.departmentName,
        },
        dailyUsage && {
          title: 'Montly Usage : ',
          info: Math.round(dailyUsage * 30),
        },
      ],
      batchInfo,
    ];

    return (
      <Expansion style={dataTableStyles.expansion}>
        <PageInfo columns={infoColumns} />
      </Expansion>
    );
  };

  render() {
    const { database, genericTablePageStyles, topRoute } = this.props;
    const { data } = this.state;

    return (
      <GenericPage
        data={data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderExpansion={this.renderExpansion}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'code',
            width: 1,
            title: tableStrings.item_code,
            sortable: true,
          },
          {
            key: 'name',
            width: 5,
            title: tableStrings.item_name,
            sortable: true,
          },
          {
            key: 'totalQuantity',
            width: 1,
            title: tableStrings.stock_on_hand,
            sortable: true,
            alignText: 'right',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        database={database}
        {...genericTablePageStyles}
        topRoute={topRoute}
      />
    );
  }
}

export default StockPage;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
StockPage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
};
