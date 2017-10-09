/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { Expansion } from 'react-native-data-table';
import { dataTableStyles, expansionPageStyles } from '../../globalStyles';
import { PageButton, ExpiryTextInput, PageInfo } from '../../widgets';
import { GenericPage } from '../GenericPage';
import { parsePositiveInteger } from '../../utilities';
import { tableStrings } from '../../localization';

/**
* Renders page to be displayed in StocktakeEditPage -> expansion.
* @prop   {Realm}               database      App wide database.
* @state  {Realm.Results}       items         the stocktakeItems of props.stocktake.
*/
export class StocktakeEditExpansion extends React.Component {
  constructor(props) {
    super(props);
    this.item = props.data;
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
          this.props.refreshParent();
          break;
        }
        case 'batch': {
          if (!newValue || newValue === '') return;
          stocktakeBatch.batch = newValue;
          break;
        }
        case 'expiryDate':
          stocktakeBatch.expiryDate = newValue;
          break;
        default:
          break;
      }
      this.props.database.save('stocktakeBatch', stocktakeBatch);
    });
  }

  refreshData() {
    this.setState({ data: this.item.batches });
  }

  renderCell(key, stocktakeBatch) {
    const isEditable = !this.item.stocktake.isFinalised;
    switch (key) {
      default:
        return {
          cellContents: stocktakeBatch[key],
        };
      case 'batch':
        return {
          type: isEditable ? 'editable' : 'text',
          cellContents: stocktakeBatch[key] && stocktakeBatch[key] !== '' ?
                        stocktakeBatch[key] : '(no batch name)', // TODO: localise
        };
      case 'countedTotalQuantity':
        return {
          type: isEditable ? 'editable' : 'text',
          cellContents: stocktakeBatch.difference === 0 ? '' :
                        stocktakeBatch.countedTotalQuantity,
          placeholder: tableStrings.no_change,
        };
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
    }
  }

  renderAddBatchButton() {
    const addNewBatch = () => {
      this.props.database.write(() => {
        this.item.addNewBatch(this.props.database);
      });
      this.refreshData();
    };
    return ( // TODO: localise addNewBatch
      <PageButton
        text={'Add Batch'}
        onPress={addNewBatch}
        isDisabled={this.item.stocktake.isFinalised}
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
          info: this.item.item.name,
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
          renderFooter={() => null} // overrides default generc pages footer
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
              title: tableStrings.snapshot_quantity,
              alignText: 'right',
            },
            {
              key: 'countedTotalQuantity',
              width: 1,
              title: tableStrings.actual_quantity,
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
          dataTypesLinked={['StocktakeBatch']}
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
  data: PropTypes.object.isRequired,
  refreshParent: PropTypes.func.isRequired,
};
