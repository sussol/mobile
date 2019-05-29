/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { StocktakeEditExpansion } from './expansions/StocktakeEditExpansion';
import { GenericPage } from './GenericPage';

import { PageButton, PageInfo, TextEditor, PageContentModal, ConfirmModal } from '../widgets';
import { SUSSOL_ORANGE } from '../globalStyles';

import {
  buttonStrings,
  modalStrings,
  navStrings,
  tableStrings,
  pageInfoStrings,
  programStrings,
} from '../localization';
import { parsePositiveInteger, truncateString, sortDataBy } from '../utilities';
import StocktakeBatchModal from '../widgets/modals/StocktakeBatchModal';
import GenericChooseModal from '../widgets/modals/GenericChooseModal';

const DATA_TYPES_SYNCHRONISED = ['StocktakeItem', 'StocktakeBatch', 'ItemBatch', 'Item'];

const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  NAME_EDIT: 'nameEdit',
};

// Below functions are redundant in stocktake now, as stock movement check when opening the
// stocktake should ensure snapshot is never an old value, making it not possible to add
// negative adjustments.
//
// This is left here for now as a fail safe.
const formatErrorItemNames = items => {
  const MAX_ITEMS_IN_ERROR_MESSAGE = 4; // Number of items to display in finalise error modal.
  const MAX_ITEM_STRING_LENGTH = 40; // Length of string representing item in error modal.
  let itemsString = '';
  items.forEach((item, index) => {
    if (!item) return; // Rerendering sometimes causes a crash here.
    if (index >= MAX_ITEMS_IN_ERROR_MESSAGE) return;
    itemsString += truncateString(`\n${item.itemCode} - ${item.itemName}`, MAX_ITEM_STRING_LENGTH);
  });
  if (items.length > MAX_ITEMS_IN_ERROR_MESSAGE) {
    itemsString +=
      `\n${modalStrings.and} ` +
      `${items.length - MAX_ITEMS_IN_ERROR_MESSAGE} ` +
      `${modalStrings.more}.`;
  }
  return itemsString;
};

/**
 * Check whether a given stocktake is safe to be finalised.
 * If stocktake is safe to finalise, return null, else return an appropriate error
 * message.
 *
 * @param  {object}  stocktake  The stocktake to check.
 * @return {string}             Null if safe to be finalised, else an error message.
 */
export const checkForFinaliseError = stocktake => {
  const { hasSomeCountedItems, itemsBelowMinimum } = stocktake;

  if (!hasSomeCountedItems) {
    return modalStrings.stocktake_no_counted_items;
  }

  if (itemsBelowMinimum.length > 0) {
    return (
      modalStrings.following_items_reduced_more_than_available_stock +
      formatErrorItemNames(itemsBelowMinimum)
    );
  }
  return null;
};

/**
 * Renders the page for displaying StocktakeEditPage.
 *
 * @prop   {Realm}         database   App wide database.
 * @prop   {func}          navigateTo CallBack for navigation stack.
 * @state  {Realm.Results} items      The |stocktakeItems| of |props.stocktake|.
 */
export class StocktakeEditPage extends React.Component {
  constructor(props) {
    super(props);
    const { stocktake } = props;
    this.items = stocktake.items;
    this.state = {
      modalKey: null,
      isModalOpen: false,
      isResetModalOpen: false,
      stocktakeItem: null,
      isStocktakeEditModalOpen: false,
      reasons: [],
      isReasonsModalOpen: false,
      currentStocktakeItem: null,
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'itemName',
      isAscending: true,
    };

    // Validate the current state of the stocktake, use modal to warn user about any issues.
    this.itemsOutdated = stocktake.itemsOutdated;
    if (!stocktake.isFinalised && this.itemsOutdated.length > 0) {
      this.state.isResetModalOpen = true;
    }
  }

  componentDidMount = () => {
    const { database } = this.props;
    const queryString = 'type == $0 && isActive == true';
    const reasons = database.objects('Options').filtered(queryString, 'stocktakeLineAdjustment');
    this.setState({ reasons });
  };

  reasonModalConfirm = ({ item: option }) => {
    if (option) {
      const { currentStocktakeItem } = this.state;
      const { database } = this.props;
      currentStocktakeItem.applyReasonToBatches(database, option);
    }
    this.setState({ isReasonsModalOpen: false });
  };

  /**
   * Opens the reason modal for applying a reason to a stocktakeItem
   * if the snapshot quantity and counted total quantity differ.
   * Otherwise, removes the reason from the stocktake items batches.
   * @param {Object} stocktakeItem
   */
  assignReason = stocktakeItem => {
    const { database } = this.props;
    if (stocktakeItem.shouldApplyReason) {
      this.onOpenReasonModal();
    } else {
      stocktakeItem.applyReasonToBatches(database);
    }
  };

  /**
   * Respond to the user editing the 'Actual Quantity' column. If the current user has
   * an Options object defined, enforce that an option must be chosen if the snapshot
   * quantity does not match the actual quantity.
   *
   * @param   {string}  key            Should always be |countedTotalQuantity|.
   * @param   {object}  stocktakeItem  The stocktake item from the row being edited.
   * @param   {string}  newValue       The value the user entered in the cell.
   * @return  {none}
   */
  onEndEditing = (key, stocktakeItem, newValue) => {
    const { database } = this.props;
    const { reasons, isReasonsModalOpen } = this.state;

    if (key !== 'countedTotalQuantity' || newValue === '') return;
    const quantity = parsePositiveInteger(newValue);
    if (quantity === null) return;
    // If the reason modal is open just ignore any change to the current line
    // This a hack to solve https://github.com/openmsupply/mobile/issues/1011
    // Underlying issue requires data table rewrite
    if (isReasonsModalOpen) return;

    stocktakeItem.setCountedTotalQuantity(database, quantity);
    if (reasons.length > 0) this.assignReason(stocktakeItem);
    this.setState({ currentStocktakeItem: stocktakeItem });
  };

  /**
   * Will reset all items contained in |this.itemsBelowMinimum| and
   * |this.itemsOutdated|.
   */
  onResetItemsConfirm = () => {
    const { database, stocktake, runWithLoadingIndicator } = this.props;
    this.setState({ isResetModalOpen: false });
    runWithLoadingIndicator(() => {
      stocktake.resetStocktakeItems(database, this.itemsOutdated);
      this.refreshData();
    });
  };

  getModalTitle = () => {
    const { modalKey } = this.state;

    const { NAME_EDIT, COMMENT_EDIT } = MODAL_KEYS;
    switch (modalKey) {
      default:
      case NAME_EDIT:
        return modalStrings.edit_the_stocktake_name;
      case COMMENT_EDIT:
        return modalStrings.edit_the_stocktake_comment;
    }
  };

  openModal = key => this.setState({ modalKey: key, isModalOpen: true });

  openCommentEditor = () => this.openModal(MODAL_KEYS.COMMENT_EDIT);

  openNameEditor = () => this.openModal(MODAL_KEYS.NAME_EDIT);

  closeModal = () => this.setState({ isModalOpen: false });

  updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // (... != null) checks for null or undefined (implicitly type coerced to null).
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  };

  /**
   * Returns updated data filtered by |searchTerm| and ordered by |sortBy| and |isAscending|.
   */
  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const data = this.items.filtered(
      'item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0',
      searchTerm
    );
    let sortDataType;
    switch (sortBy) {
      case 'mostUsedReasonTitle':
      case 'itemCode':
      case 'itemName':
        sortDataType = 'string';
        break;
      case 'snapshotTotalQuantity':
      case 'countedTotalQuantity':
      case 'difference':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({
      data: sortDataBy(data, sortBy, sortDataType, isAscending),
    });
  };

  onOpenReasonModal = () => {
    this.setState({ isReasonsModalOpen: true });
  };

  renderCell = (key, stocktakeItem) => {
    const { stocktake } = this.props;
    const isEditable = !stocktake.isFinalised;
    const { hasAnyReason } = stocktakeItem;
    switch (key) {
      default:
        return stocktakeItem[key];
      case 'countedTotalQuantity': {
        let cellContents;
        if (!stocktakeItem.hasCountedBatches) {
          // If not editable (i.e. finalised) display 0 not '', as placeholder isn't shown.
          cellContents = isEditable ? '' : 0;
        } else {
          cellContents = stocktakeItem.countedTotalQuantity;
        }
        // If finalised display 0 not '', as placeholder isn't shown.
        return {
          type: isEditable ? 'editable' : 'text',
          cellContents,
          placeholder: tableStrings.not_counted,
        };
      }
      case 'difference': {
        const { difference } = stocktakeItem;
        const prefix = difference > 0 ? '+' : '';
        return { cellContents: `${prefix}${difference}` };
      }
      case 'mostUsedReasonTitle': {
        return (
          <TouchableOpacity
            key={stocktakeItem.id}
            onPress={() =>
              hasAnyReason && isEditable
                ? this.setState({ currentStocktakeItem: stocktakeItem }, this.onOpenReasonModal)
                : null
            }
            style={localStyles.reasonCell}
          >
            {hasAnyReason && isEditable && (
              <Icon name="external-link" size={14} color={SUSSOL_ORANGE} />
            )}
            <Text style={{ width: '80%' }} numberOfLines={1} ellipsizeMode="tail">
              {stocktakeItem.mostUsedReasonTitle
                ? stocktakeItem.mostUsedReasonTitle
                : programStrings.not_applicable}
            </Text>
          </TouchableOpacity>
        );
      }
      case 'modalControl': {
        return (
          <TouchableOpacity
            onPress={() => {
              this.openBatchModal(stocktakeItem);
            }}
          >
            <View style={localStyles.modalControl}>
              <Icon name="angle-double-up" size={20} color={SUSSOL_ORANGE} />
            </View>
          </TouchableOpacity>
        );
      }
    }
  };

  renderManageStocktakeButton = () => {
    const { navigateTo, stocktake } = this.props;

    return (
      <PageButton
        text={buttonStrings.manage_stocktake}
        onPress={() =>
          navigateTo('stocktakeManager', navStrings.manage_stocktake, {
            stocktake,
          })
        }
        isDisabled={stocktake.isFinalised}
      />
    );
  };

  renderExpansion = stocktakeItem => {
    const { database, genericTablePageStyles } = this.props;

    return (
      <StocktakeEditExpansion
        stocktakeItem={stocktakeItem}
        database={database}
        genericTablePageStyles={genericTablePageStyles}
      />
    );
  };

  renderModalContent = () => {
    const { stocktake, database } = this.props;
    const { modalKey } = this.state;

    const { NAME_EDIT, COMMENT_EDIT } = MODAL_KEYS;

    switch (modalKey) {
      default:
      case COMMENT_EDIT:
        return (
          <TextEditor
            text={stocktake.comment}
            onEndEditing={newComment => {
              if (newComment !== stocktake.comment) {
                database.write(() => {
                  stocktake.comment = newComment;
                  database.save('Stocktake', stocktake);
                });
              }
              this.closeModal();
            }}
          />
        );
      case NAME_EDIT:
        return (
          <TextEditor
            text={stocktake.name}
            onEndEditing={newName => {
              if (newName !== stocktake.name) {
                database.write(() => {
                  stocktake.name = newName;
                  database.save('Stocktake', stocktake);
                });
              }
              this.closeModal();
            }}
          />
        );
    }
  };

  renderPageInfo = () => {
    const { stocktake } = this.props;
    const { name, comment, isFinalised } = stocktake;
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.stocktake_name}:`,
          info: name,
          onPress: this.openNameEditor,
          editableType: 'text',
          canEdit: true,
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: comment,
          onPress: this.openCommentEditor,
          editableType: 'text',
          canEdit: true,
        },
      ],
    ];
    if (stocktake.program) {
      infoColumns[0].unshift({
        title: `${programStrings.program}:`,
        info: stocktake.program.name,
      });
    }

    return (
      <View style={{ width: '50%' }}>
        <PageInfo columns={infoColumns} isEditingDisabled={isFinalised} />
      </View>
    );
  };

  onConfirmBatchModal = () => {
    this.setState({ isStocktakeEditModalOpen: false });
  };

  openBatchModal = item => {
    this.setState({ stocktakeItem: item, isStocktakeEditModalOpen: true });
  };

  renderReasonModal = () => {
    const { currentStocktakeItem, isReasonsModalOpen, reasons } = this.state;
    const currentReasonIndex = reasons.findIndex(
      reason => reason.title === currentStocktakeItem.mostUsedReasonTitle
    );

    return (
      <GenericChooseModal
        isOpen={isReasonsModalOpen}
        data={reasons}
        highlightIndex={currentReasonIndex}
        keyToDisplay="title"
        onPress={this.reasonModalConfirm}
        title={modalStrings.select_a_reason}
      />
    );
  };

  getColumns = () => {
    const { reasons } = this.state;
    const columns = [
      {
        key: 'itemCode',
        width: 1,
        title: tableStrings.item_code,
        sortable: true,
        alignText: 'right',
      },
      {
        key: 'itemName',
        width: 2.8,
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
    ];
    if (reasons.length > 0) {
      columns.push({
        key: 'mostUsedReasonTitle',
        width: 1.2,
        title: tableStrings.reason,
        sortable: true,
        alignText: 'right',
      });
    }
    columns.push({
      key: 'modalControl',
      width: 0.8,
      title: tableStrings.batches,
      sortable: false,
    });
    return columns;
  };

  render() {
    const { database, genericTablePageStyles, stocktake, topRoute } = this.props;
    const {
      data,
      isResetModalOpen,
      isModalOpen,
      stocktakeItem,
      isStocktakeEditModalOpen,
      isReasonsModalOpen,
    } = this.state;
    const resetModalText = isResetModalOpen // Small optimisation.
      ? modalStrings.stocktake_invalid_stock + formatErrorItemNames(this.itemsOutdated)
      : '';

    return (
      <GenericPage
        data={data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopRightComponent={stocktake.program ? null : this.renderManageStocktakeButton}
        renderTopLeftComponent={this.renderPageInfo}
        onEndEditing={this.onEndEditing}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={this.getColumns()}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        dataTypesLinked={['StocktakeBatch']}
        finalisableDataType="Stocktake"
        database={database}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        <PageContentModal
          isOpen={isModalOpen && !stocktake.isFinalised}
          onClose={this.closeModal}
          title={this.getModalTitle()}
        >
          {this.renderModalContent()}
        </PageContentModal>

        <ConfirmModal
          coverScreen
          noCancel
          isOpen={isResetModalOpen}
          questionText={resetModalText}
          onConfirm={this.onResetItemsConfirm}
        />

        <StocktakeBatchModal
          isOpen={isStocktakeEditModalOpen}
          stocktakeItem={stocktakeItem}
          database={database}
          genericTablePageStyles={genericTablePageStyles}
          onConfirm={this.onConfirmBatchModal}
        />

        {isReasonsModalOpen && this.renderReasonModal()}
      </GenericPage>
    );
  }
}

/* eslint-disable react/require-default-props, react/forbid-prop-types */
StocktakeEditPage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  navigateTo: PropTypes.func.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  stocktake: PropTypes.object.isRequired,
  topRoute: PropTypes.bool,
};

const localStyles = StyleSheet.create({
  reasonCell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  modalControl: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: '100%',
    minHeight: '100%',
  },
});
