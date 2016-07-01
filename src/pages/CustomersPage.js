/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { SearchBar } from '../widgets';
import { GenericTablePage } from './GenericTablePage';

const DATA_TYPES_DISPLAYED = ['Customer'];

/**
* Renders the page for displaying Customers.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only supplier_invoice.
*/
export class CustomersPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'serialNumber';
    this.state.customers = props.database.objects('Name')
                                            .filtered('type == "store" OR type == "patient"');
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
  }

  onRowPress(customer) {
    this.props.navigateTo(
      'Customers',
      `${customer.name}`,
      { transaction: customer },
    );
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.state.customers.filtered(`name BEGINSWITH "${searchTerm}"`);
    data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
    return data;
  }

  renderCell(key, customer) {
    switch (key) {
      default:
      case 'code':
        return customer.code;
      case 'name':
        return customer.name;
      case 'transactions.length':
        return customer.transactions.length;
      case 'selected':
        return customer.name;
    }
  }

  renderSearchBar() {
    return (
      <SearchBar
        onChange={(event) => this.onSearchChange(event)}
        keyboardType="numeric"
      />);
  }
}

CustomersPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'code',
    width: 1,
    title: 'CODE',
    sortable: true,
  },
  {
    key: 'name',
    width: 1,
    title: 'NAME',
    sortable: true,
  },
  {
    key: 'transactions.length',
    width: 1,
    title: 'ENTERED DATE',
    sortable: true,
  },
  {
    key: 'selected',
    width: 3,
    title: 'MASTER LIST',
  },
];
