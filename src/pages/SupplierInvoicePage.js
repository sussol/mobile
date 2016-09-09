/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { View } from 'react-native';

import { PageInfo } from '../widgets';
import { formatDate, sortDataBy } from '../utilities';
import { GenericTablePage } from './GenericTablePage';
import globalStyles from '../globalStyles';
import { pageInfoStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];

export class SupplierInvoicePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.columns = COLUMNS;
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.finalisableDataType = 'Transaction';
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
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
    return sortDataBy(data, sortBy, sortDataType, isAscending);
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
      transactionItem.setTotalQuantity(this.props.database, parseFloat(newValue));
      this.props.database.save('TransactionItem', transactionItem);
    });
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
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderPageInfo()}
              {this.renderSearchBar()}
            </View>
          </View>
          {this.renderDataTable()}
        </View>
      </View>
    );
  }
}

SupplierInvoicePage.propTypes = {
  database: React.PropTypes.object,
};

const COLUMNS = [
  {
    key: 'itemCode',
    width: 1,
    titleKey: 'item_code',
    sortable: true,
  },
  {
    key: 'itemName',
    width: 2,
    titleKey: 'item_name',
    sortable: true,
  },
  {
    key: 'totalQuantitySent',
    width: 1,
    titleKey: 'number_sent',
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'numReceived',
    width: 1,
    titleKey: 'number_recieved',
    sortable: true,
    alignText: 'right',
  },
];
