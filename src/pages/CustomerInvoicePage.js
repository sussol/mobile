/* @flow weak */

/**
 * mSupply MobileAndroid
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  View,
} from 'react-native';

import { GenericTablePage } from './GenericTablePage';
import globalStyles from '../globalStyles';
import { BottomConfirmModal, PageButton, PageInfo, SelectModal } from '../widgets';
import { formatDate, parsePositiveNumber } from '../utilities';
import { createRecord } from '../database';

const DATA_TYPES_DISPLAYED =
        ['Transaction', 'TransactionBatch', 'TransactionItem', 'Item', 'ItemBatch'];

export class CustomerInvoicePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.state.isAddingNewItem = false;
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onAddMasterItems = this.onAddMasterItems.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.renderPageInfo = this.renderPageInfo.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.props.transaction.items.filtered('item.name BEGINSWITH[c] $0', searchTerm);
    switch (sortBy) {
      case 'itemCode':
        data = data.slice().sort((a, b) =>
          a.item.code.localeCompare(b.item.code));
        if (!isAscending) data.reverse();
        break;
      case 'itemName':
        data = data.slice().sort((a, b) =>
          a.item.name.localeCompare(b.item.name));
        if (!isAscending) data.reverse();
        break;
      default:
        data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
        break;
    }
    return data;
  }

  onAddMasterItems() {
    this.props.database.write(() => {
      this.props.transaction.addItemsFromMasterList(this.props.database);
      this.props.database.save('Transaction', this.props.transaction);
    });
  }

  /**
   * Respond to the user editing the number in the number received column
   * @param  {string} key             Should always be 'quantityToIssue'
   * @param  {object} transactionItem The transaction item from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, transactionItem, newValue) {
    if (key !== 'quantityToIssue') return;
    this.props.database.write(() => {
      const quantity = Math.min(parsePositiveNumber(newValue), transactionItem.availableQuantity);
      transactionItem.setTotalQuantity(this.props.database, quantity);
      this.props.database.save('TransactionItem', transactionItem);
    });
  }

  onDeleteConfirm() {
    const { selection } = this.state;
    const { transaction, database } = this.props;
    database.write(() => {
      transaction.removeItemsById(database, selection);
      database.save('Transaction', transaction);
    });
    this.setState({ selection: [] });
    this.refreshData();
  }

  onDeleteCancel() {
    this.setState({ selection: [] });
    this.refreshData();
  }

  renderPageInfo() {
    const infoColumns = [
      [
        {
          title: 'Entry Date:',
          info: formatDate(this.props.transaction.entryDate),
        },
        {
          title: 'Confirm Date:',
          info: formatDate(this.props.transaction.confirmDate),
        },
        {
          title: 'Entered By:',
          info: this.props.transaction.enteredBy && this.props.transaction.enteredBy.username,
        },
      ],
      [
        {
          title: 'Customer:',
          info: this.props.transaction.otherParty && this.props.transaction.otherParty.name,
        },
        {
          title: 'Their Ref:',
          info: this.props.transaction.theirRef,
        },
        {
          title: 'Comment:',
          info: this.props.transaction.comment,
        },
      ],
    ];
    return <PageInfo columns={infoColumns} />;
  }

  renderCell(key, transactionItem) {
    switch (key) {
      default:
      case 'itemName':
        return transactionItem.item && transactionItem.item.name;
      case 'itemCode':
        return transactionItem.item && transactionItem.item.code;
      case 'availableQuantity':
        return transactionItem.availableQuantity;
      case 'quantityToIssue':
        return {
          cellContents: transactionItem.totalQuantity,
          type: this.props.transaction.isFinalised ? 'text' : 'editable',
        };
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: this.props.transaction.isFinalised,
        };
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.verticalContainer}>
              {this.renderPageInfo()}
              {this.renderSearchBar()}
            </View>
            <View style={globalStyles.verticalContainer}>
              <PageButton
                text="New Item"
                onPress={() => this.setState({ isAddingNewItem: true })}
                isDisabled={this.props.transaction.isFinalised}
              />
              <PageButton
                text="Add Master List Items"
                onPress={this.onAddMasterItems}
                isDisabled={this.props.transaction.isFinalised}
              />
            </View>
          </View>
          {this.renderDataTable()}
          <BottomConfirmModal
            isOpen={this.state.selection.length > 0 && !this.props.transaction.isFinalised}
            questionText="Are you sure you want to remove these items?"
            onCancel={() => this.onDeleteCancel()}
            onConfirm={() => this.onDeleteConfirm()}
            confirmText="Remove"
          />
          <SelectModal
            isOpen={this.state.isAddingNewItem && !this.props.transaction.isFinalised}
            options={this.props.database.objects('Item')}
            queryString={'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'}
            onSelect={(item) => {
              this.props.database.write(() => {
                createRecord(this.props.database, 'TransactionItem', this.props.transaction, item);
              });
              this.setState({ isAddingNewItem: false });
            }}
            onCancel={() => this.setState({ isAddingNewItem: false })}
          />
        </View>
      </View>
    );
  }
}

CustomerInvoicePage.propTypes = {
  database: React.PropTypes.object,
  transaction: React.PropTypes.object,
};

const COLUMNS = [
  {
    key: 'itemCode',
    width: 2,
    title: 'CODE',
    sortable: true,
  },
  {
    key: 'itemName',
    width: 4,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'availableQuantity',
    width: 2,
    title: 'AVAILABLE STOCK',
    sortable: true,
  },
  {
    key: 'quantityToIssue',
    width: 2,
    title: 'QUANTITY',
    sortable: true,
  },
  {
    key: 'remove',
    width: 1,
    title: 'REMOVE',
  },
];
