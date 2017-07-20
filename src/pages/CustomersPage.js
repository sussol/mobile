/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { GenericPage } from './GenericPage';
import { sortDataBy } from '../utilities';
import { tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Name'];

/**
* Renders the page for displaying Customers.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only supplier_invoice.
*/
export class CustomersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: props.database.objects('Customer'),
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'name',
      isAscending: true,
    };
    autobind(this);
  }

  onRowPress(customer) {
    this.props.navigateTo(
      'customer',
      `${customer.name}`,
      { customer: customer },
    );
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
  refreshData(newSearchTerm, newSortBy, newIsAscending) {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const data = this.state.customers.filtered(
      'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0',
      searchTerm
    );

    let sortDataType;
    switch (sortBy) {
      case 'numberOfTransactions':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({ data: sortDataBy(data, sortBy, sortDataType, isAscending) });
  }

  renderCell(key, customer) {
    switch (key) {
      default:
      case 'code':
        return customer.code;
      case 'name':
        return customer.name;
      case 'numberOfTransactions':
        return customer.numberOfTransactions;
    }
  }

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        onRowPress={this.onRowPress}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'code',
            width: 1,
            title: tableStrings.code,
            sortable: true,
          },
          {
            key: 'name',
            width: 5,
            title: tableStrings.name,
            sortable: true,
          },
          {
            key: 'numberOfTransactions',
            width: 1,
            title: tableStrings.invoices,
            alignText: 'right',
            sortable: true,
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        database={this.props.database}
        {...this.props.genericTablePageStyles}
      />
    );
  }
}

CustomersPage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  navigateTo: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
};
