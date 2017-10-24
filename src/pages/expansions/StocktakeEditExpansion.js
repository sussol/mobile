/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { Expansion } from 'react-native-data-table';
import { dataTableStyles, expansionPageStyles } from '../../globalStyles';
import { PageButton, ExpiryTextInput, PageInfo } from '../../widgets';
import { GenericPage } from '../GenericPage';
import { parsePositiveInteger } from '../../utilities';
import { tableStrings, buttonStrings } from '../../localization';

/**
* Renders page to be displayed in StocktakeEditPage -> expansion.
* @prop   {Realm}               database        App wide database.
* @prop   {Realm.object}        stocktakeItem   The stocktakeItem, a parent of
*                                               StocktakeBatches in this expansion
*/
export class StocktakeEditExpansion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    autobind(this);
  }

  onEndEditing(key, stocktakeBatch, newValue) {
    this.props.database.write(() => {
      switch (key) {
        case 'countedTotalQuantity': {
          const newCountedQuantity = parsePositiveInteger(newValue);
          if (newCountedQuantity === null) return;

          stocktakeBatch.countedTotalQuantity = parsePositiveInteger(newValue);
          break;
        }
        case 'batch': {
          if (!newValue || newValue === '' ||
              newValue === `(${tableStrings.no_batch_name})`) {
            stocktakeBatch.batch = '';
          } else stocktakeBatch.batch = newValue;
          break;
        }
        case 'expiryDate':
          stocktakeBatch.expiryDate = newValue;
          break;
        default:
          break;
      }
      this.props.database.save('StocktakeBatch', stocktakeBatch);
    });
  }

  refreshData() {
    this.setState({ data: this.props.stocktakeItem.batches });
  }

  renderCell(key, stocktakeBatch) {
    const { stocktake } = this.props.stocktakeItem;
    const isEditable = !stocktake.isFinalised;
    switch (key) {
      default:
        return {
          cellContents: stocktakeBatch[key],
        };
      case 'batch':
        return {
          type: isEditable ? 'editable' : 'text',
          cellContents: stocktakeBatch[key] && stocktakeBatch[key] !== '' ?
                        stocktakeBatch[key] : `(${tableStrings.no_batch_name})`,
          keyboardType: 'default',
        };
      case 'countedTotalQuantity': {
        const emptyCellContents = isEditable ? '' : tableStrings.not_counted;
        return {
          type: isEditable ? 'editable' : 'text',
          cellContents: stocktakeBatch.hasBeenCounted ?
                        stocktakeBatch.countedTotalQuantity : emptyCellContents,
          placeholder: tableStrings.not_counted,
        };
      }
      case 'expiryDate': {
        return (
          <ExpiryTextInput
            key={key}
            isEditable={isEditable}
            onEndEditing={(newValue) => {
              this.onEndEditing(key, stocktakeBatch, newValue);
              this.refreshData();
            }}
            text={stocktakeBatch[key]}
            style={dataTableStyles.text}
          />
        );
      }
      case 'difference': {
        const difference = stocktakeBatch.difference;
        const prefix = difference > 0 ? '+' : '';
        return { cellContents: `${prefix}${difference}` };
      }
    }
  }

  renderAddBatchButton() {
    const { stocktakeItem } = this.props;
    const addNewBatch = () => {
      this.props.database.write(() => {
        stocktakeItem.createNewBatch(this.props.database);
      });
      this.refreshData();
    };
    return (
      <PageButton
        text={buttonStrings.add_batch}
        onPress={addNewBatch}
        isDisabled={stocktakeItem.stocktake.isFinalised}
        style={localStyles.addBatchButton}
      />
    );
  }

  renderFooter() {
    return null;
  }

  renderPageInfo() {
    const infoColumns = [
      [
        {
          title: 'By Batch:',
          info: this.props.stocktakeItem.itemName,
        },
      ],
    ];
    return (
      <PageInfo
        columns={infoColumns}
      />
    );
  }

  render() {
    return (
      <Expansion style={dataTableStyles.expansionWithInnerPage}>
        <GenericPage
          data={this.state.data}
          renderCell={this.renderCell}
          refreshData={this.refreshData}
          hideSearchBar={true}
          renderDataTableFooter={() => null} // overrides default generc pages footer
          dontRenderSearchBar={true}
          onEndEditing={this.onEndEditing}
          renderTopLeftComponent={this.renderPageInfo}
          renderTopRightComponent={this.renderAddBatchButton}
          columns={[
            {
              key: 'batch',
              width: 2,
              title: 'BATCH NAME',
              alignText: 'center',
            },
            {
              key: 'expiryDate',
              width: 1,
              title: 'EXPIRY',
              alignText: 'center',
            },
            {
              key: 'snapshotTotalQuantity',
              width: 1,
              title: unwrapText(tableStrings.snapshot_quantity),
              alignText: 'right',
            },
            {
              key: 'countedTotalQuantity',
              width: 1,
              title: unwrapText(tableStrings.actual_quantity),
              alignText: 'right',
            },
            {
              key: 'difference',
              width: 1,
              title: tableStrings.difference,
              alignText: 'right',
            },
          ]}
          dataTypesLinked={['StocktakeBatch', 'Stocktake']}
          database={this.props.database}
          {...this.props.genericTablePageStyles}
          pageStyles={expansionPageStyles}
        />
      </Expansion>
    );
  }
}

StocktakeEditExpansion.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  stocktakeItem: PropTypes.object.isRequired,
};

const unwrapText = (text) => text.replace(/\n/g, ' ');

const localStyles = StyleSheet.create({
  addBatchButton: {
    height: 30,
    width: 90,
  },
});
