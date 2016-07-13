/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { GenericTablePage } from './GenericTablePage';

const DATA_TYPES_DISPLAYED = ['Item'];

/**
* Renders the page for displaying Customers.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only supplier_invoice.
*/
export class StockPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.state.items = props.database.objects('Item');
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.state.items.filtered(`name BEGINSWITH[c] "${searchTerm}"`);
    data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
    return data;
  }

  renderCell(key, item) {
    switch (key) {
      default:
      case 'code':
        return item.code;
      case 'name':
        return item.name;
      case 'totalQuantity':
        return item.totalQuantity;
    }
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
    title: 'ITEM CODE',
    sortable: true,

  },
  {
    key: 'name',
    width: 5,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'totalQuantity',
    width: 1,
    title: 'STOCK ON HAND',
  },
];
