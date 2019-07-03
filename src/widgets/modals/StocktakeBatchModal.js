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
import { Button, PageButton, ExpiryTextInput, PageInfo } from '..';
import { GenericChooseModal } from './GenericChooseModal';

import { tableStrings, buttonStrings, modalStrings, pageInfoStrings } from '../../localization';
import { parsePositiveInteger } from '../../utilities';

import globalStyles, {
  WARM_GREY,
  SUSSOL_ORANGE,
  DARK_GREY,
  dataTableStyles,
  expansionPageStyles,
} from '../../globalStyles';

export class StocktakeBatchModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reasonModalOpen: false,
      currentBatch: null,
      reasons: [],
    };
  }

  componentDidMount = () => {
    const { database } = this.props;
    const queryString = 'type == $0 && isActive == true';
    const reasons = database.objects('Options').filtered(queryString, 'stocktakeLineAdjustment');
    this.setState({ reasons });
  };

  reasonModalConfirm = ({ item: option }) => {
    if (option) {
      const { currentBatch } = this.state;
      const { id } = currentBatch;
      const { database } = this.props;
      database.write(() => database.update('StocktakeBatch', { id, option }));
    }
    this.setState({ reasonModalOpen: false });
  };

  /**
   * Opens the reason modal for applying a reason to a stocktakeBatch
   * if the snapshot quantity and counted total quantity differ.
   * Otherwise, removes the reason from the stocktake items batches.
   * @param {Object} stocktakeBatch
   */
  assignReason = stocktakeBatch => {
    if (stocktakeBatch.shouldApplyReason) {
      this.setState({ reasonModalOpen: true, currentBatch: stocktakeBatch });
    } else {
      const { database } = this.props;
      const { id } = stocktakeBatch;
      database.write(() => database.update('StocktakeBatch', { id, option: null }));
    }
  };

  onEndEditing = (key, stocktakeBatch, newValue) => {
    if (!newValue || newValue === '') return;

    const { reasons, reasonModalOpen } = this.state;
    const { database } = this.props;

    // If the reason modal is open just ignore any change to the current line
    // This a hack to solve similar issue https://github.com/openmsupply/mobile/issues/1011
    // Underlying issue requires data table rewrite
    if (reasonModalOpen) return;

    const { id } = stocktakeBatch;
    switch (key) {
      case 'countedTotalQuantity': {
        if (parsePositiveInteger(newValue) === null) return;
        database.write(() => {
          stocktakeBatch.countedTotalQuantity = parsePositiveInteger(newValue);
        });
        database.save(stocktakeBatch);
        if (reasons.length > 0) this.assignReason(stocktakeBatch);
        break;
      }
      case 'batch': {
        let newBatchName = '';
        if (newValue !== `(${tableStrings.no_batch_name})`) newBatchName = newValue;
        database.write(() => database.update('StocktakeBatch', { id, batch: newBatchName }));
        break;
      }
      case 'expiryDate':
        database.write(() => database.update('StocktakeBatch', { id, expiryDate: newValue }));
        break;
      default:
        break;
    }
  };

  refreshData = () => {
    const { stocktakeItem } = this.props;
    this.setState({ data: stocktakeItem.batches });
  };

  renderCell = (key, stocktakeBatch) => {
    const { stocktakeItem } = this.props;
    const { stocktake } = stocktakeItem;
    const isEditable = !stocktake.isFinalised;
    const { option } = stocktakeBatch;
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
            onPress={() =>
              option && isEditable
                ? this.setState({ reasonModalOpen: true, currentBatch: stocktakeBatch })
                : null
            }
            style={localStyles.reasonCell}
          >
            {option && isEditable && <Icon name="external-link" size={14} color={SUSSOL_ORANGE} />}
            <Text style={{ width: '80%' }} numberOfLines={1} ellipsizeMode="tail">
              {stocktakeBatch.option ? stocktakeBatch.option.title : ''}
            </Text>
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
          title: pageInfoStrings.by_batch,
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

  renderReasonModal = () => {
    const { reasonModalOpen, currentBatch, reasons } = this.state;
    const { option } = currentBatch;
    const currentReasonIndex = option && reasons.findIndex(reason => reason.id === option.id);

    return (
      <GenericChooseModal
        isOpen={reasonModalOpen}
        data={reasons}
        highlightIndex={currentReasonIndex}
        onPress={this.reasonModalConfirm}
        keyToDisplay="title"
        title={modalStrings.select_a_reason}
      />
    );
  };

  getColumns = () => {
    const { reasons } = this.state;
    const columns = [
      {
        key: 'batch',
        width: 2,
        title: tableStrings.batch_name,
        alignText: 'center',
      },
      {
        key: 'expiryDate',
        width: 1,
        title: tableStrings.expiry,
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
    if (reasons.length > 0) {
      columns.push({
        key: 'reason',
        width: 1,
        title: tableStrings.reason,
        alignText: 'right',
      });
    }
    return columns;
  };

  render() {
    const { database, genericTablePageStyles, isOpen } = this.props;
    const { data, reasonModalOpen } = this.state;
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
        {reasonModalOpen && this.renderReasonModal()}
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
    padding: 20,
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

export default StocktakeBatchModal;
