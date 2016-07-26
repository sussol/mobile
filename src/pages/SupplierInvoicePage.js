/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { View } from 'react-native';

import { PageInfo } from '../widgets';
import { formatDate } from '../utilities';
import { GenericTablePage } from './GenericTablePage';
import globalStyles from '../globalStyles';

const DATA_TYPES_DISPLAYED = ['Transaction', 'TransactionItem', 'Item', 'ItemBatch'];

export class SupplierInvoicePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.props.transaction.items
                 .filtered('item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0', searchTerm);
    switch (sortBy) {
      case 'itemName':
        data = data.slice().sort((a, b) =>
          a.item.name.localeCompare(b.item.name));
        if (!isAscending) data.reverse();
        break;
      case 'itemCode':
        data = data.slice().sort((a, b) =>
          a.item.code.localeCompare(b.item.code));
        if (!isAscending) data.reverse();
        break;
      case 'totalQuantitySent':
        data = data.slice().sort((a, b) => a.totalQuantitySent - b.totalQuantitySent);
        if (!isAscending) data.reverse();
        break;
      case 'numReceived':
        data = data.slice().sort((a, b) => a.totalQuantity - b.totalQuantity);
        if (!isAscending) data.reverse();
        break;
      default:
        data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
        break;
    }
    return data;
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
          title: 'Entry Date:',
          info: formatDate(transaction.entryDate),
        },
        {
          title: 'Confirm Date:',
          info: formatDate(transaction.confirmDate),
        },
      ],
      [
        {
          title: 'Their Ref:',
          info: transaction.theirRef,
        },
        {
          title: 'Comment:',
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
    key: 'itemName',
    width: 2,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'itemCode',
    width: 1,
    title: 'CODE',
    sortable: true,
  },
  {
    key: 'totalQuantitySent',
    width: 1,
    title: 'NUM. SENT',
    sortable: true,
  },
  {
    key: 'numReceived',
    width: 1,
    title: 'NUM. RECEIVED',
    sortable: true,
  },
];
