/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { GenericTablePage } from './GenericTablePage';
import { Expansion } from '../widgets/DataTable';
import { PageInfo } from '../widgets';
import globalStyles from '../globalStyles';
import { formatDate, sortDataBy } from '../utilities';
import { tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Item', 'ItemBatch', 'ItemCategory'];

/**
* Renders the page for all Items and their stock, with expansion of further details.
* @prop   {Realm}               database    App wide database.
* @prop   {func}                navigateTo  CallBack for navigation stack.
* @state  {Realm.Results}       items       Contains all Items stored on the local database.
*/
export class StockPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.state.items = props.database.objects('Item');
    this.columns = COLUMNS;
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    const data = this.state.items.filtered(
      'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0',
      searchTerm
    );
    let sortDataType;
    switch (sortBy) {
      case 'totalQuantity':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    return sortDataBy(data, sortBy, sortDataType, isAscending);
  }

  renderExpansion(item) {
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
      ],
      [
        {
          title: `${tableStrings.number_of_batches}:`,
          info: item.batches && item.batches.length,
        },
        {
          title: `${tableStrings.earliest_expiry}:`,
          info: item.earliestExpiringBatch
                && formatDate(item.earliestExpiringBatch.expiryDate),
        },
      ],
    ];
    return (
      <Expansion style={globalStyles.dataTableExpansion}>
        <PageInfo columns={infoColumns} />
      </Expansion>
    );
  }

  renderCell(key, item) {
    return item[key];
  }
}

StockPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'code',
    width: 1,
    titleKey: 'item_code',
    sortable: true,
  },
  {
    key: 'name',
    width: 5,
    titleKey: 'item_name',
    sortable: true,
  },
  {
    key: 'totalQuantity',
    width: 1,
    titleKey: 'stock_on_hand',
    sortable: true,
    alignText: 'right',
  },
];
