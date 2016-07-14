/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { SETTINGS_KEYS } from '../settings';
import { SearchBar } from '../widgets';
import { GenericTablePage } from './GenericTablePage';

const DATA_TYPES_DISPLAYED = ['Name'];

/**
* Renders the page for displaying Customers.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only supplier_invoice.
*/
export class CustomersPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    const thisStoreId = this.props.settings.get(SETTINGS_KEYS.THIS_STORE_ID);
    this.state.customers = props.database.getCustomersOfStore(thisStoreId);
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
  }

  onRowPress(customer) {
    this.props.navigateTo(
      'customer',
      `${customer.name}`,
      { customer: customer },
    );
  }

  onCheckablePress(customer) {
    super.onCheckablePress(customer);
    this.props.database.write(() => {
      if (!customer.useMasterList) {
        customer.useMasterList = true;
      } else {
        customer.useMasterList = !customer.useMasterList;
      }
      this.props.database.save('Name', customer);
    });
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.state.customers.filtered(`name BEGINSWITH[c] "${searchTerm}"`);
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
        return {
          type: 'checkable',
          isChecked: customer.useMasterList,
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
}

CustomersPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
  settings: React.PropTypes.object.isRequired,
};

const COLUMNS = [
  {
    key: 'code',
    width: 1,
    title: 'CODE',
  },
  {
    key: 'name',
    width: 5,
    title: 'NAME',
    sortable: true,
  },
  {
    key: 'transactions.length',
    width: 1,
    title: 'INVOICES',
  },
  {
    key: 'selected',
    width: 1,
    title: 'MASTER LIST',
  },
];
