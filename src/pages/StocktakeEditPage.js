/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import { View } from 'react-native';
import { PageButton } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';
import { parsePositiveInteger, truncateString, sortDataBy } from '../utilities';

const DATA_TYPES_DISPLAYED = ['Stocktake', 'StocktakeItem', 'StocktakeBatch', 'ItemBatch', 'Item'];

/**
* Renders the page for displaying StocktakeEditPage.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       items         the stocktakeItems of props.stocktake.
*/
export class StocktakeEditPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.items = props.stocktake.items;
    this.state.sortBy = 'itemName';
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.renderCell = this.renderCell.bind(this);
  }

  /**
   * Respond to the user editing the number in the ACTUAL QUANTITY column.
   * @param  {string} key           Should always be 'countedTotalQuantity'
   * @param  {object} stocktakeItem The stocktake item from the row being edited
   * @param  {string} newValue      The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, stocktakeItem, newValue) {
    if (key !== 'countedTotalQuantity' || newValue === '') return;
    this.props.database.write(() => {
      const quantity = parsePositiveInteger(newValue);
      stocktakeItem.countedTotalQuantity = quantity;
      this.props.database.save('StocktakeItem', stocktakeItem);
    });
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    const data = this.state.items.filtered(
      'item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0',
      searchTerm
    );
    let sortDataType;
    switch (sortBy) {
      case 'itemCode':
      case 'itemName':
        sortDataType = 'string';
        break;
      case 'snapshotTotalQuantity':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    return sortDataBy(data, sortBy, sortDataType, isAscending);
  }

  renderCell(key, item) {
    switch (key) {
      default:
        return item[key];
      case 'countedTotalQuantity':
        return {
          type: this.props.stocktake.isFinalised ? 'text' : 'editable',
          cellContents: item.countedTotalQuantity !== null ? item.countedTotalQuantity : '',
        };
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderSearchBar()}
            </View>
            <PageButton
              text="Manage Stocktake"
              onPress={() => this.props.navigateTo('stocktakeManager', 'Manage Stocktake', {
                stocktake: this.props.stocktake,
              })}
              isDisabled={this.props.stocktake.isFinalised}
            />
          </View>
          {this.renderDataTable()}
        </View>
      </View>
    );
  }
}

StocktakeEditPage.propTypes = {
  database: React.PropTypes.object,
  stocktake: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'itemCode',
    width: 1,
    title: 'ITEM CODE',
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'itemName',
    width: 3,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'snapshotTotalQuantity',
    width: 1,
    title: 'SNAPSHOT QUANTITY',
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'countedTotalQuantity',
    width: 1,
    title: 'ACTUAL QUANTITY',
    sortable: true,
    alignText: 'right',
  },
];

const MAX_ITEMS_IN_ERROR_MESSAGE = 6; // Number of items to display in finalise error modal
const MAX_ITEM_STRING_LENGTH = 40; // Length of string representing item in error modal

/**
 * Check whether a given stocktake is safe to be finalised. Return null if it is,
 * otherwise return an appropriate error message if not.
 * @param  {object}  stocktake  The stocktake to check
 * @return {string}  An error message if not able to be finalised
 */
export function checkForFinaliseError(stocktake) {
  if (stocktake.hasSomeCountedItems) return "Can't finalise a stocktake with no counted items";
  const itemsBelowMinimum = stocktake.itemsBelowMinimum;
  if (itemsBelowMinimum.length > 0) {
    let errorString = 'The following items have been reduced by more than the available stock:';
    itemsBelowMinimum.forEach((stocktakeItem, index) => {
      if (index > MAX_ITEMS_IN_ERROR_MESSAGE) return;
      errorString += truncateString(`\n${stocktakeItem.itemCode} - ${stocktakeItem.itemName}`,
                                    MAX_ITEM_STRING_LENGTH);
    });
    if (itemsBelowMinimum.length > MAX_ITEMS_IN_ERROR_MESSAGE) {
      errorString += `\nand ${itemsBelowMinimum.length - MAX_ITEMS_IN_ERROR_MESSAGE} more.`;
    }
    return errorString;
  }
  return null;
}
