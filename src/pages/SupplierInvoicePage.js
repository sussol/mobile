/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';

import { PageInfo } from '../widgets';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';
import { GenericPage } from './GenericPage';
import { pageInfoStrings, tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];

export class SupplierInvoicePage extends React.Component {
  constructor(props) {
    super(props);
    this.dataFilters = {
      sortBy: 'itemName',
    };
    this.state = {};
    autobind(this);
  }

  /**
   * Respond to the user editing the number in the number received column
   * @param  {string} key             Should always be 'numReceived'
   * @param  {object} transactionItem The transaction item from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, transactionItem, newValue) {
    if (key !== 'numReceived') return;
    this.props.database.write(() => {
      transactionItem.setTotalQuantity(this.props.database, parsePositiveInteger(newValue));
      this.props.database.save('TransactionItem', transactionItem);
    });
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
    const data = this.props.transaction.items.filtered(
      'item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0',
      searchTerm
    );
    let sortDataType;
    switch (sortBy) {
      case 'itemName':
      case 'itemCode':
        sortDataType = 'string';
        break;
      case 'totalQuantitySent':
      case 'numReceived':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({ data: sortDataBy(data, sortBy, sortDataType, isAscending) });
  }

  renderPageInfo() {
    const { transaction } = this.props;
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(transaction.entryDate),
        },
        {
          title: `${pageInfoStrings.confirm_date}:`,
          info: formatDate(transaction.confirmDate),
        },
      ],
      [
        {
          title: `${pageInfoStrings.their_ref}:`,
          info: transaction.theirRef,
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: transaction.comment,
        },
      ],
    ];
    return <PageInfo columns={infoColumns} />;
  }

  renderCell(key, transactionItem) {
    switch (key) {
      default:
        return transactionItem[key];
      case 'numReceived': {
        const isEditable = !this.props.transaction.isFinalised;
        const type = isEditable ? 'editable' : 'text';
        const renderedCell = {
          type: type,
          cellContents: transactionItem.totalQuantity,
        };
        return renderedCell;
      }
    }
  }

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopLeftComponent={this.renderPageInfo}
        onEndEditing={this.onEndEditing}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'itemCode',
            width: 1,
            title: tableStrings.item_code,
            sortable: true,
          },
          {
            key: 'itemName',
            width: 2,
            title: tableStrings.item_name,
            sortable: true,
          },
          {
            key: 'totalQuantitySent',
            width: 1,
            title: tableStrings.number_sent,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'numReceived',
            width: 1,
            title: tableStrings.number_received,
            sortable: true,
            alignText: 'right',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        finalisableDataType={'Transaction'}
        database={this.props.database}
        {...this.props.genericTablePageStyles}
      />
    );
  }
}

SupplierInvoicePage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  transaction: PropTypes.object,
};
