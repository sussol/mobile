/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  View,
} from 'react-native';

import { GenericTablePage } from './GenericTablePage';
import globalStyles from '../globalStyles';
import { Button, PageInfo, ToggleBar } from '../widgets';
import { formatDate } from '../utilities';

const DATA_TYPES_DISPLAYED = ['Transaction', 'TransactionLine', 'Item', 'ItemLine'];

export class CustomerInvoicePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.state.isUsingMasterList = this.props.transaction.useMasterList;
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.databaseListenerId = null;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.renderPageInfo = this.renderPageInfo.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.props.transaction.items.filtered(`item.name BEGINSWITH[c] "${searchTerm}"`);
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

  toggleMasterList() {
    this.setState({ isUsingMasterList: !this.state.isUsingMasterList });
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
          editable: !this.props.transaction.isFinalised,
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
              <Button
                style={globalStyles.button}
                textStyle={globalStyles.buttonText}
                text="New Item"
                onPress={this.onNewInvoice}
              />
              <ToggleBar
                style={globalStyles.toggleBar}
                textOffStyle={globalStyles.toggleText}
                textOnStyle={globalStyles.toggleTextSelected}
                toggleOffStyle={globalStyles.toggleOption}
                toggleOnStyle={globalStyles.toggleOptionSelected}
                toggles={[
                  {
                    text: 'Use Master List',
                    onPress: () => this.toggleMasterList(),
                    isOn: this.state.isUsingMasterList,
                  },
                ]}
              />
            </View>
          </View>
          {this.renderDataTable()}
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
    key: 'totalQuantity',
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
