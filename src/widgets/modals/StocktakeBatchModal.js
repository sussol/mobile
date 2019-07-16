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
import { Button, PageButton, ExpiryTextInput, PageInfo, GenericChoiceList } from '..';
import { PageContentModal } from './PageContentModal';

import {
  programStrings,
  tableStrings,
  buttonStrings,
  modalStrings,
  pageInfoStrings,
} from '../../localization';
import { parsePositiveInteger } from '../../utilities';
import globalStyles, {
  WARM_GREY,
  SUSSOL_ORANGE,
  DARK_GREY,
  dataTableStyles,
  expansionPageStyles,
} from '../../globalStyles';

const MODAL_KEYS = {
  REASON_EDIT: 'reasonEdit',
};
export class StocktakeBatchModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentBatch: null,
      reasons: [],
      isModalOpen: false,
      modalKey: null,
    };
  }

  componentDidMount = () => {
    const { database } = this.props;
    const queryString = 'type == $0 && isActive == true';
    const reasons = database.objects('Options').filtered(queryString, 'stocktakeLineAdjustment');
    this.setState({ reasons });
  };

  openModal = (key, currentBatch) => {
    this.setState({ modalKey: key, isModalOpen: true, currentBatch });
  };

  closeModal = () => this.setState({ isModalOpen: false });

  reasonModalConfirm = ({ item: option }) => {
    if (option) {
      const { database } = this.props;
      const { currentBatch } = this.state;
      const { id } = currentBatch;
      database.write(() => database.update('StocktakeBatch', { id, option }));
    }
    this.closeModal();
  };

  /**
   * Opens the reason modal for applying a reason to a stocktakeBatch
   * if the snapshot quantity and counted total quantity differ.
   * Otherwise, removes the reason from the stocktake items batches.
   * @param {Object} stocktakeBatch
   */
  assignReason = stocktakeBatch => {
    const { REASON_EDIT } = MODAL_KEYS;
    const { database } = this.props;
    const { id, shouldApplyReason } = stocktakeBatch;
    if (shouldApplyReason) this.openModal(this, REASON_EDIT, stocktakeBatch);
    else database.write(() => database.update('StocktakeBatch', { id, option: null }));
  };

  onEndEditing = (key, stocktakeBatch, newValue) => {
    const { reasons, isModalOpen } = this.state;
    const { database } = this.props;
    const { id } = stocktakeBatch;

    if (!newValue) return;
    // If the reason modal is open just ignore any change to the current line
    if (isModalOpen) return;
    switch (key) {
      case 'countedTotalQuantity': {
        const quantity = parsePositiveInteger(newValue);
        if (quantity === null) return;
        database.write(() => {
          stocktakeBatch.countedTotalQuantity = quantity;
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
    const { REASON_EDIT } = MODAL_KEYS;
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
        const onPress = this.openModal.bind(this, REASON_EDIT, stocktakeBatch);
        const editable = option && isEditable;
        return (
          <TouchableOpacity
            key={stocktakeBatch.id}
            onPress={editable ? onPress : null}
            style={localStyles.reasonCell}
          >
            {editable && <Icon name="external-link" size={14} color={SUSSOL_ORANGE} />}
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
          text={buttonStrings.done}
          disabledColor={WARM_GREY}
          style={[globalStyles.button, localStyles.OKButton]}
          textStyle={[globalStyles.buttonText, localStyles.OKButtonText]}
          onPress={onConfirm}
        />
      </View>
    );
  };

  getModalTitle = () => {
    const { modalKey } = this.state;
    const { REASON_EDIT } = MODAL_KEYS;
    switch (modalKey) {
      default:
        return '';
      case REASON_EDIT:
        return programStrings.select_a_reason;
    }
  };

  renderModalContent = () => {
    const { modalKey, currentBatch, reasons } = this.state;
    const { option } = currentBatch;
    const highlightValue = option && option.title;
    const { REASON_EDIT } = MODAL_KEYS;
    switch (modalKey) {
      default: {
        return null;
      }
      case REASON_EDIT: {
        return (
          <GenericChoiceList
            data={reasons}
            highlightValue={highlightValue}
            keyToDisplay="title"
            onPress={this.reasonModalConfirm}
            title={modalStrings.select_a_reason}
          />
        );
      }
    }
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
    const { data, isModalOpen, modalKey } = this.state;
    const { REASON_EDIT } = MODAL_KEYS;

    return (
      <Modal
        isOpen={isOpen}
        style={[localStyles.modal]}
        backdropOpacity={0.33}
        position="top"
        backdropPressToClose={false}
        swipeToClose={false}
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
        {isModalOpen && (
          <PageContentModal
            isOpen={isModalOpen}
            onClose={this.closeModal}
            title={this.getModalTitle()}
            coverScreen={modalKey === REASON_EDIT}
          >
            {this.renderModalContent()}
          </PageContentModal>
        )}
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

export default StocktakeBatchModal;

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
