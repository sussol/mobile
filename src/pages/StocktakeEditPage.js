/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import { View } from 'react-native';
import { PageButton } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';

const DATA_TYPES_DISPLAYED = ['StocktakeItem', 'StocktakeBatch', 'ItemBatch', 'Item'];

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
    if (key !== 'countedTotalQuantity') return;
    this.props.database.write(() => {
      const quantity = Math.round(parseFloat(newValue));
      stocktakeItem.setCountedNumberOfPacks(this.props.database, quantity);
      this.props.database.save('StocktakeItem', stocktakeItem);
    });
  }
  /**
   * Returns updated data according to searchTerm, sortBy and isAscending. Cannot search or sortby
   * class calculated fields.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.state.items.filtered(`item.name BEGINSWITH[c] "${searchTerm}"`);
    if (sortBy === 'itemName') {
      // Convert to javascript array obj then sort with standard array functions.
      data = data.slice().sort((a, b) => a.item.name.localeCompare(b.item.name));
    } else {
      data = data.slice().sort((a, b) => a.item.code.localeCompare(b.item.code));
    }
    if (!isAscending) data.reverse();
    return data;
  }

  renderCell(key, item) {
    switch (key) {
      default:
        return item[key];
      case 'countedTotalQuantity':
        return {
          type: this.props.stocktake.isFinalised ? 'text' : 'editable',
          cellContents: item.countedTotalQuantity,
        };
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            {this.renderSearchBar()}
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
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'itemCode',
    width: 1,
    title: 'ITEM CODE',
    sortable: true,
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
  },
  {
    key: 'countedTotalQuantity',
    width: 1,
    title: 'ACTUAL QUANTITY',
  },
];
