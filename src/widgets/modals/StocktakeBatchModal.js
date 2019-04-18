/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-native-modalbox';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GenericPage } from '../../pages/GenericPage';

import { tableStrings, buttonStrings } from '../../localization';
import { parsePositiveInteger } from '../../utilities';
import { Button, PageButton, ExpiryTextInput, PageInfo } from '..';
import globalStyles, {
  WARM_GREY,
  SUSSOL_ORANGE,
  DARK_GREY,
  dataTableStyles,
  expansionPageStyles,
} from '../../globalStyles';
import GenericChooseModal from './GenericChooseModal';

export default class StocktakeBatchModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reasonModalOpen: false,
      currentBatch: null,
    };
  }

  componentDidMount = () => {
    const { database } = this.props;
    this.setState({ usesReasons: database.objects('Options').length !== 0 });
  };

  onEndEditing = (key, stocktakeBatch, newValue) => {
    const { database } = this.props;

    database.write(() => {
      switch (key) {
        case 'countedTotalQuantity': {
          const newCountedQuantity = parsePositiveInteger(newValue);
          if (newCountedQuantity === null) return;

          stocktakeBatch.countedTotalQuantity = parsePositiveInteger(newValue);

          if (newCountedQuantity !== stocktakeBatch.snapshotTotalQuantity) {
            this.setState({ currentBatch: stocktakeBatch, reasonModalOpen: true });
          }
          break;
        }
        case 'batch': {
          if (!newValue || newValue === '' || newValue === `(${tableStrings.no_batch_name})`) {
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
      database.save('StocktakeBatch', stocktakeBatch);
    });
  };

  refreshData = () => {
    const { stocktakeItem } = this.props;
    this.setState({ data: stocktakeItem.batches });
  };

  renderCell = (key, stocktakeBatch) => {
    const { stocktakeItem } = this.props;
    const { stocktake } = stocktakeItem;
    const isEditable = !stocktake.isFinalised;
    switch (key) {
      default:
        return {
          cellContents: stocktakeBatch[key],
        };
      case 'batch':
        return {
          type: isEditable ? 'editable' : 'text',
          cellContents:
            stocktakeBatch[key] && stocktakeBatch[key] !== ''
              ? stocktakeBatch[key]
              : `(${tableStrings.no_batch_name})`,
          keyboardType: 'default',
        };
      case 'countedTotalQuantity': {
        const emptyCellContents = isEditable ? '' : tableStrings.not_counted;
        return {
          type: isEditable ? 'editable' : 'text',
          cellContents: stocktakeBatch.hasBeenCounted
            ? stocktakeBatch.countedTotalQuantity
            : emptyCellContents,
          placeholder: tableStrings.not_counted,
        };
      }
      case 'expiryDate': {
        return (
          <ExpiryTextInput
            key={stocktakeBatch.id}
            isEditable={isEditable}
            onEndEditing={newValue => {
              this.onEndEditing(key, stocktakeBatch, newValue);
              this.refreshData();
            }}
            text={stocktakeBatch[key]}
            style={dataTableStyles.text}
          />
        );
      }
      case 'difference': {
        const { difference } = stocktakeBatch;
        const prefix = difference > 0 ? '+' : '';
        return { cellContents: `${prefix}${difference}` };
      }
      case 'reason': {
        return (
          <TouchableOpacity
            key={stocktakeBatch.id}
            onPress={() => this.setState({ reasonModalOpen: true, currentBatch: stocktakeBatch })}
            style={localStyles.reasonCell}
          >
            <Text style={{ width: '80%' }} numberOfLines={1} ellipsizeMode="tail">
              {stocktakeBatch.option ? stocktakeBatch.option.title : ''}
            </Text>
            <Icon name="external-link" size={14} color={SUSSOL_ORANGE} />
          </TouchableOpacity>
        );
      }
    }
  };

  renderAddBatchButton = () => {
    const { database, stocktakeItem } = this.props;

    const addNewBatch = () => {
      database.write(() => {
        stocktakeItem.createNewBatch(database);
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
  };

  renderPageInfo = () => {
    const { stocktakeItem } = this.props;
    const { itemName } = stocktakeItem;

    const infoColumns = [
      [
        {
          title: 'By Batch:',
          info: itemName,
        },
      ],
    ];
    return <PageInfo columns={infoColumns} />;
  };

  renderFooter = () => {
    const { onConfirm } = this.props;
    return (
      <View style={localStyles.footer}>
        <Button
          text="OK"
          disabledColor={WARM_GREY}
          style={[globalStyles.button, localStyles.OKButton]}
          textStyle={[globalStyles.buttonText, localStyles.OKButtonText]}
          onPress={onConfirm}
        />
      </View>
    );
  };

  reasonModalConfirm = ({ item: option }) => {
    const { currentBatch } = this.state;
    const { database } = this.props;

    database.write(() => {
      database.update('StocktakeBatch', { id: currentBatch.id, option });
    });
    this.setState({ reasonModalOpen: false });
  };

  getColumns = () => {
    const { usesReasons } = this.state;
    const columns = [
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
    ];
    if (usesReasons) {
      columns.push({
        key: 'reason',
        width: 1,
        title: 'Reason',
        alignText: 'right',
      });
    }
    return columns;
  };

  render() {
    const { database, genericTablePageStyles, isOpen } = this.props;
    const { data, reasonModalOpen, currentBatch } = this.state;

    return (
      <Modal
        isOpen={isOpen}
        style={[localStyles.modal]}
        backdropPressToClose={true}
        backdropOpacity={0.33}
        swipeToClose={false}
        position="top"
      >
        <GenericPage
          data={data}
          renderCell={this.renderCell}
          refreshData={this.refreshData}
          hideSearchBar={true}
          dontRenderSearchBar={true}
          onEndEditing={this.onEndEditing}
          renderTopLeftComponent={this.renderPageInfo}
          renderTopRightComponent={this.renderAddBatchButton}
          columns={this.getColumns()}
          dataTypesLinked={['StocktakeBatch', 'Stocktake']}
          database={database}
          pageStyles={expansionPageStyles}
          {...genericTablePageStyles}
        />

        <GenericChooseModal
          isOpen={reasonModalOpen}
          data={database.objects('Options')}
          highlightIndex={
            currentBatch && currentBatch.option
              ? database.objects('Options').indexOf(currentBatch.option)
              : 0
          }
          onPress={this.reasonModalConfirm}
          field="title"
          title="Select a reason"
        />

        {this.renderFooter()}
      </Modal>
    );
  }
}

StocktakeBatchModal.defaultProps = {
  genericTablePageStyles: {},
};

StocktakeBatchModal.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  stocktakeItem: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

const unwrapText = text => text.replace(/\n/g, ' ');
const localStyles = StyleSheet.create({
  addBatchButton: {
    height: 30,
    width: 90,
  },
  modal: {
    height: '100%',
    width: '100%',
    padding: 50,
    backgroundColor: DARK_GREY,
  },
  footer: {
    flex: 1,
    maxHeight: 50,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  OKButton: {
    backgroundColor: SUSSOL_ORANGE,
  },
  OKButtonText: {
    color: 'white',
    fontSize: 16,
  },
  reasonCell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
});
