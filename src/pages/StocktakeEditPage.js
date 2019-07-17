/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { GenericPage } from './GenericPage';
import { GenericChoiceList, PageButton, PageInfo, TextEditor } from '../widgets';
import { PageContentModal, ConfirmModal, StocktakeBatchModal } from '../widgets/modals';

import { parsePositiveInteger, truncateString, sortDataBy } from '../utilities';
import {
  buttonStrings,
  modalStrings,
  navStrings,
  tableStrings,
  pageInfoStrings,
  programStrings,
} from '../localization';

import { SUSSOL_ORANGE } from '../globalStyles';

const DATA_TYPES_SYNCHRONISED = ['StocktakeItem', 'StocktakeBatch', 'ItemBatch', 'Item'];

const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  NAME_EDIT: 'nameEdit',
  REASON_EDIT: 'reasonEdit',
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
      isStocktakeEditModalOpen: false,
      reasons: [],
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
    this.closeModal();
  };

  /**
   * Opens the reason modal for applying a reason to a stocktakeItem
   * if the snapshot quantity and counted total quantity differ.
   * Otherwise, removes the reason from the stocktake items batches.
   * @param {Object} stocktakeItem
   */
  assignReason = stocktakeItem => {
    const { database } = this.props;
    const { REASON_EDIT } = MODAL_KEYS;
    const { shouldHaveReason, hasAnyReason } = stocktakeItem;
    if (shouldHaveReason) {
      if (!hasAnyReason) this.openModal(REASON_EDIT, stocktakeItem);
    } else stocktakeItem.applyReasonToBatches(database);
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
    const { reasons, isModalOpen } = this.state;

    if (key !== 'countedTotalQuantity' || !newValue) return;
    // If the reason modal is open just ignore any change to the current line
    if (isModalOpen) return;
    const quantity = parsePositiveInteger(newValue);
    if (quantity === null) return;
    stocktakeItem.setCountedTotalQuantity(database, quantity);

    if (reasons.length > 0) this.assignReason(stocktakeItem);
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
    const { NAME_EDIT, COMMENT_EDIT, REASON_EDIT } = MODAL_KEYS;

    switch (modalKey) {
      default:
      case NAME_EDIT:
        return modalStrings.edit_the_stocktake_name;
      case COMMENT_EDIT:
        return modalStrings.edit_the_stocktake_comment;
      case REASON_EDIT:
        return programStrings.select_a_reason;
    }
  };

  openModal = (key, stocktakeItem) =>
    this.setState({ modalKey: key, isModalOpen: true, currentStocktakeItem: stocktakeItem });

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

  renderCell = (key, stocktakeItem) => {
    const { stocktake } = this.props;
    const isEditable = !stocktake.isFinalised;
    const { hasAnyReason } = stocktakeItem;
    const { REASON_EDIT } = MODAL_KEYS;
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
        const canEdit = hasAnyReason && isEditable;
        const onPress = this.openModal.bind(this, REASON_EDIT, stocktakeItem);
        return (
          <TouchableOpacity
            key={stocktakeItem.id}
            onPress={canEdit ? onPress : null}
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
              this.setState({
                isStocktakeEditModalOpen: true,
                currentStocktakeItem: stocktakeItem,
              });
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

  renderModalContent = () => {
    const { stocktake, database } = this.props;
    const { modalKey } = this.state;

    const { NAME_EDIT, COMMENT_EDIT, REASON_EDIT } = MODAL_KEYS;

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
      case REASON_EDIT: {
        const { currentStocktakeItem, reasons } = this.state;
        const { mostUsedReasonTitle } = currentStocktakeItem;
        return (
          <GenericChoiceList
            data={reasons}
            highlightValue={mostUsedReasonTitle}
            keyToDisplay="title"
            onPress={this.reasonModalConfirm}
            title={modalStrings.select_a_reason}
          />
        );
      }
    }
  };

  renderPageInfo = () => {
    const { stocktake } = this.props;
    const { name, comment, isFinalised } = stocktake;
    const { NAME_EDIT, COMMENT_EDIT } = MODAL_KEYS;
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.stocktake_name}:`,
          info: name,
          onPress: this.openModal.bind(this, NAME_EDIT),
          editableType: 'text',
          canEdit: true,
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: comment,
          onPress: this.openModal.bind(this, COMMENT_EDIT),
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
      currentStocktakeItem,
      isStocktakeEditModalOpen,
      modalKey,
    } = this.state;
    const { REASON_EDIT } = MODAL_KEYS;
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
        {isModalOpen && (
          <PageContentModal
            isOpen={isModalOpen && !stocktake.isFinalised}
            onClose={
              currentStocktakeItem && currentStocktakeItem.enforceReason ? null : this.closeModal
            }
            title={this.getModalTitle()}
            coverScreen={modalKey === REASON_EDIT}
          >
            {this.renderModalContent()}
          </PageContentModal>
        )}

        <ConfirmModal
          coverScreen
          noCancel
          isOpen={isResetModalOpen}
          questionText={resetModalText}
          onConfirm={this.onResetItemsConfirm}
        />

        <StocktakeBatchModal
          isOpen={isStocktakeEditModalOpen}
          stocktakeItem={currentStocktakeItem}
          database={database}
          genericTablePageStyles={genericTablePageStyles}
          onConfirm={this.onConfirmBatchModal}
        />
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
