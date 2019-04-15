/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GenericPage } from './GenericPage';

import { formatStatus, sortDataBy } from '../utilities';
import { navStrings, tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Requisition'];

/**
 * Renders the page for displaying customer requisitions (requests from a customer to this store)
 *
 * @prop  {Realm}         database     App wide database.
 * @prop  {func}          navigateTo   CallBack for navigation stack.
 * @prop  {Realm.Object}  currentUser  User object representing the currently logged in user.
 */
export class CustomerRequisitionsPage extends React.Component {
  constructor(props) {
    super(props);
    this.requisitions = props.database.objects('ResponseRequisition');
    this.state = {};
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'serialNumber',
      isAscending: false,
    };
  }

  onRowPress = requisition => this.navigateToRequisition(requisition);

  navigateToRequisition = requisition => {
    const { navigateTo } = this.props;

    navigateTo('customerRequisition', `${navStrings.requisition} ${requisition.serialNumber}`, {
      requisition,
    });
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
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const data = this.requisitions.filtered('serialNumber BEGINSWITH $0', searchTerm);
    let sortDataType;
    switch (sortBy) {
      case 'serialNumber':
      case 'numberOfItems':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({
      data: sortDataBy(data, sortBy, sortDataType, isAscending),
    });
  };

  renderCell = (key, requisition) => {
    switch (key) {
      case 'entryDate':
        return requisition.entryDate.toDateString();
      case 'customerName':
        return requisition.otherStoreName ? requisition.otherStoreName.name : '';
      case 'status':
        return formatStatus(requisition.status);
      default:
        return requisition[key];
    }
  };

  render() {
    const { data } = this.state;
    const { database, genericTablePageStyles, topRoute } = this.props;

    return (
      <GenericPage
        data={data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        onRowPress={this.onRowPress}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'serialNumber',
            width: 1.5,
            title: tableStrings.requisition_number,
            sortable: true,
          },
          {
            key: 'customerName',
            width: 2,
            title: tableStrings.customer,
            sortable: false,
          },
          {
            key: 'entryDate',
            width: 1,
            title: tableStrings.entered_date,
            sortable: true,
          },
          {
            key: 'numberOfItems',
            width: 1,
            title: tableStrings.items,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'status',
            width: 1,
            title: tableStrings.status,
            sortable: true,
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

export default CustomerRequisitionsPage;

/* eslint-disable react/require-default-props, react/forbid-prop-types */
CustomerRequisitionsPage.propTypes = {
  database: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
};
