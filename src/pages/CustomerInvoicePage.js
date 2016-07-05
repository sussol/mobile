/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { GenericTablePage } from './GenericTablePage';
import globalStyles from '../globalStyles';
import { Button, PageInfo, SelectModal } from '../widgets';
import { formatDate } from '../utilities';

const DATA_TYPES_DISPLAYED = ['Transaction', 'TransactionLine', 'Item', 'ItemLine'];

export class CustomerInvoicePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.state.isAddingNewItem = false;
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.databaseListenerId = null;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.onAddMasterList = this.onAddMasterList.bind(this);
    this.onNewItem = this.onNewItem.bind(this);
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

  /**
   * Respond to the user editing the number in the number received column
   * @param  {string} key             Should always be 'numReceived'
   * @param  {object} transactionItem The transaction item from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, transactionItem, newValue) {
    if (key !== 'quantityToIssue') return;
    this.props.database.write(() => {
      transactionItem.totalQuantity = parseFloat(newValue); // eslint-disable-line no-param-reassign
      this.props.database.save('TransactionItem', transactionItem);
    });
  }

  onAddMasterList() {
    return;
  }

  onNewItem() {
    this.setState({ isAddingNewItem: true });
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
        return 'hi';
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
              <Button
                style={[globalStyles.button, localStyles.button]}
                textStyle={globalStyles.buttonText}
                text="New Item"
                onPress={this.onNewItem}
              />
              <Button
                style={[globalStyles.button, localStyles.button]}
                textStyle={globalStyles.buttonText}
                text="Add Master Items"
                onPress={this.onAddMasterList}
              />
            </View>
          </View>
          {this.renderDataTable()}
        </View>
        <SelectModal
          isOpen={this.state.isAddingNewItem}
          options={this.props.database.objects('Item')}
          queryString={'name BEGINSWITH[c] $0'}
          getItemString={(item) => `${item.code} - ${item.name}`}
          onSelect={(item) => {
            this.props.database.write(() => {
              this.props.transaction.addItem(this.props.database, item);
              this.props.database.save('Transaction', this.props.transaction);
            });
            this.setState({ isAddingNewItem: false });
          }}
          onCancel={() => this.setState({ isAddingNewItem: false })}
        />
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

const localStyles = StyleSheet.create({
  button: {
    marginBottom: 10,
  },
});
