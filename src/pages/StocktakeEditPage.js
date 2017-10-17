/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { StocktakeEditExpansion } from './expansions/StocktakeEditExpansion';
import { PageButton } from '../widgets';
import { GenericPage } from './GenericPage';
import { parsePositiveInteger, truncateString, sortDataBy } from '../utilities';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['StocktakeItem', 'StocktakeBatch', 'ItemBatch', 'Item'];

/**
* Renders the page for displaying StocktakeEditPage.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       items         the stocktakeItems of props.stocktake.
*/
export class StocktakeEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.items = props.stocktake.items;
    this.state = {};
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'itemName',
      isAscending: true,
    };
    autobind(this);
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
    const quantity = parsePositiveInteger(newValue);
    if (quantity === null) return;

    stocktakeItem.setCountedTotalQuantity(this.props.database, quantity);
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
    const data = this.items.filtered(
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
      case 'difference':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({ data: sortDataBy(data, sortBy, sortDataType, isAscending) });
  }

  renderCell(key, item) {
    const isEditable = !this.props.stocktake.isFinalised;
    switch (key) {
      default:
        return item[key];
      case 'countedTotalQuantity': {
        const emptyCellContents = isEditable ? '' : tableStrings.no_change;
        return {
          type: isEditable ? 'editable' : 'text',
          cellContents: item.hasBatchWithQuantityChange ?
                        item.countedTotalQuantity : emptyCellContents,
          placeholder: tableStrings.no_change,
        };
      }
      case 'difference': {
        const difference = item.difference;
        const prefix = difference > 0 ? '+' : '';
        return { cellContents: `${prefix}${difference}` };
      }
    }
  }

  renderManageStocktakeButton() {
    return (
      <PageButton
        text={buttonStrings.manage_stocktake}
        onPress={() => this.props.navigateTo('stocktakeManager',
          navStrings.manage_stocktake,
          { stocktake: this.props.stocktake },
          )}
        isDisabled={this.props.stocktake.isFinalised}
      />
    );
  }

  renderExpansion(item) {
    return (
      <StocktakeEditExpansion
        data={item}
        database={this.props.database}
        genericTablePageStyles={this.props.genericTablePageStyles}
      />
    );
  }

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderExpansion={this.renderExpansion}
        renderTopRightComponent={this.renderManageStocktakeButton}
        onEndEditing={this.onEndEditing}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'itemCode',
            width: 1,
            title: tableStrings.item_code,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'itemName',
            width: 3.2,
            title: tableStrings.item_name,
            sortable: true,
          },
          {
            key: 'snapshotTotalQuantity',
            width: 1.2,
            title: tableStrings.snapshot_quantity,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'countedTotalQuantity',
            width: 1.2,
            title: tableStrings.actual_quantity,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'difference',
            width: 1,
            title: tableStrings.difference,
            sortable: true,
            alignText: 'right',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        dataTypesLinked={['StocktakeBatch']}
        finalisableDataType={'Stocktake'}
        database={this.props.database}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      />
    );
  }
}

StocktakeEditPage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  stocktake: PropTypes.object.isRequired,
  navigateTo: PropTypes.func.isRequired,
};

const MAX_ITEMS_IN_ERROR_MESSAGE = 4; // Number of items to display in finalise error modal
const MAX_ITEM_STRING_LENGTH = 40; // Length of string representing item in error modal

/**
 * Check whether a given stocktake is safe to be finalised. Return null if it is,
 * otherwise return an appropriate error message if not.
 * @param  {object}  stocktake  The stocktake to check
 * @return {string}  An error message if not able to be finalised
 */
export function checkForFinaliseError(stocktake) {
  const itemsBelowMinimum = stocktake.itemsBelowMinimum;
  if (itemsBelowMinimum.length > 0) {
    let errorString = modalStrings.following_items_reduced_more_than_available_stock;
    itemsBelowMinimum.forEach((stocktakeItem, index) => {
      if (index >= MAX_ITEMS_IN_ERROR_MESSAGE) return;
      errorString += truncateString(`\n${stocktakeItem.itemCode} - ${stocktakeItem.itemName}`,
                                    MAX_ITEM_STRING_LENGTH);
    });
    if (itemsBelowMinimum.length > MAX_ITEMS_IN_ERROR_MESSAGE) {
      errorString += `\n${modalStrings.and} ` +
                      `${itemsBelowMinimum.length - MAX_ITEMS_IN_ERROR_MESSAGE} ` +
                      `${modalStrings.more}.`;
    }
    return errorString;
  }
  return null;
}
