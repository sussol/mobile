/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';
import { Expansion } from 'react-native-data-table';
import dateFormater from 'dateformat';
import { GenericPage } from './GenericPage';

import { createRecord } from '../database';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import { SETTINGS_KEYS } from '../settings';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';
import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageInfo,
  PageContentModal,
  TextEditor,
  ToggleSelector,
} from '../widgets';

import globalStyles, { dataTableStyles } from '../globalStyles';

const DATA_TYPES_SYNCHRONISED = ['RequisitionItem', 'Item', 'ItemBatch'];

const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  ITEM_SELECT: 'itemSelect',
  MONTHS_SELECT: 'monthsSelect',
};

export class SupplierRequisitionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalKey: null,
      modalIsOpen: false,
      selection: [],
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'itemName',
      isAscending: true,
    };
  }

  componentWillMount() {
    this.refreshIsVaccine();
  }

  onAddMasterItems = () => {
    const { database, requisition, runWithLoadingIndicator } = this.props;

    runWithLoadingIndicator(() => {
      database.write(() => {
        requisition.addItemsFromMasterList(database, this.getThisStore());
        database.save('Requisition', requisition);
      });
      this.refreshData();
    });
  };

  onCreateAutomaticOrder = () => {
    const { database, requisition, runWithLoadingIndicator } = this.props;

    runWithLoadingIndicator(() => {
      database.write(() => {
        requisition.createAutomaticOrder(database, this.getThisStore());
        database.save('Requisition', requisition);
      });
      this.refreshData();
    });
    this.refreshIsVaccine();
  };

  /**
   * Respond to the user editing the number in the required quantity column.
   *
   * @param   {string}  key              Should always be |requiredQuantity|.
   * @param   {object}  requisitionItem  The requisition item from the row being edited.
   * @param   {string}  newValue         The value the user entered in the cell.
   * @return  {none}
   */
  onEndEditing = (key, requisitionItem, newValue) => {
    const { database } = this.props;

    if (key !== 'requiredQuantity') return;

    database.write(() => {
      requisitionItem.requiredQuantity = parsePositiveInteger(newValue);
      database.save('RequisitionItem', requisitionItem);
    });
  };

  refreshIsVaccine = () => {
    const { requisition } = this.props;

    const isVaccine = requisition.items.some(({ item }) => item.isVaccine);
    this.setState({ isVaccine });
  };

  onDeleteConfirm = () => {
    const { requisition, database } = this.props;
    const { selection } = this.state;

    database.write(() => {
      requisition.removeItemsById(database, selection);
      database.save('Requisition', requisition);
    });
    this.setState({ selection: [] });
    this.refreshData();
  };

  onDeleteCancel = () => {
    this.setState({ selection: [] });
    this.refreshData();
  };

  onUseSuggestedQuantities = () => {
    const { runWithLoadingIndicator } = this.props;

    runWithLoadingIndicator(() => {
      const { database, requisition } = this.props;
      database.write(() => {
        requisition.setRequestedToSuggested(database);
        database.save('Requisition', requisition);
      });
      this.refreshData();
    });
  };

  onSelectionChange = newSelection => this.setState({ selection: newSelection });

  getThisStore = () => {
    const { database, settings } = this.props;

    const thisStoreNameId = settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID);
    const nameResults = database.objects('Name').filtered('id == $0', thisStoreNameId);

    if (!nameResults || nameResults.length <= 0) return null;

    return nameResults[0];
  };

  getModalTitle = () => {
    const { modalKey } = this.state;

    const { ITEM_SELECT, COMMENT_EDIT, MONTHS_SELECT } = MODAL_KEYS;

    switch (modalKey) {
      default:
      case ITEM_SELECT:
        return modalStrings.search_for_an_item_to_add;
      case COMMENT_EDIT:
        return modalStrings.edit_the_requisition_comment;
      case MONTHS_SELECT:
        return modalStrings.select_the_number_of_months_stock_required;
    }
  };

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
    const { requisition } = this.props;

    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;

    const data = requisition.items.filtered(
      'item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0',
      searchTerm
    );

    let sortDataType;
    switch (sortBy) {
      case 'itemCode':
      case 'itemName':
        sortDataType = 'string';
        break;
      case 'monthlyUsage':
      case 'suggestedQuantity':
      case 'requiredQuantity':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({
      data: sortDataBy(data, sortBy, sortDataType, isAscending),
    });
  };

  openModal = key => this.setState({ modalKey: key, modalIsOpen: true });

  closeModal = () => this.setState({ modalIsOpen: false });

  openItemSelector = () => this.openModal(MODAL_KEYS.ITEM_SELECT);

  openMonthsSelector = () => this.openModal(MODAL_KEYS.MONTHS_SELECT);

  openCommentEditor = () => this.openModal(MODAL_KEYS.COMMENT_EDIT);

  renderPageInfo = () => {
    const { requisition } = this.props;
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(requisition.entryDate),
        },
        {
          title: `${pageInfoStrings.entered_by}:`,
          info: requisition.enteredByName,
        },
      ],
      [
        {
          title: `${pageInfoStrings.supplier}:`,
          info: requisition.otherStoreName ? requisition.otherStoreName.name : '',
        },
        {
          title: `${pageInfoStrings.months_stock_required}:`,
          info: requisition.monthsToSupply,
          onPress: this.openMonthsSelector,
          editableType: 'selectable',
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: requisition.comment,
          onPress: this.openCommentEditor,
          editableType: 'text',
        },
      ],
    ];
    return <PageInfo columns={infoColumns} isEditingDisabled={requisition.isFinalised} />;
  };

  renderCell = (key, requisitionItem) => {
    const { requisition } = this.props;

    switch (key) {
      default:
        return requisitionItem[key];
      case 'monthlyUsage':
      case 'suggestedQuantity':
        return Math.round(requisitionItem[key]);
      case 'requiredQuantity':
        return {
          type: requisition.isFinalised ? 'text' : 'editable',
          cellContents: Math.round(requisitionItem.requiredQuantity),
        };
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: requisition.isFinalised,
        };
    }
  };

  renderModalContent = () => {
    const { modalKey } = this.state;
    const { database, requisition } = this.props;

    const { COMMENT_EDIT, ITEM_SELECT, MONTHS_SELECT } = MODAL_KEYS;

    switch (modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={database.objects('Item')}
            queryString="name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0"
            queryStringSecondary="name CONTAINS[c] $0"
            sortByString="name"
            onSelect={item => {
              database.write(() => {
                if (!requisition.hasItem(item)) {
                  createRecord(database, 'RequisitionItem', requisition, item);
                }
              });
              this.refreshIsVaccine();
              this.refreshData();
              this.closeModal();
            }}
            renderLeftText={item => `${item.name}`}
            renderRightText={item => `${item.totalQuantity}`}
          />
        );
      case MONTHS_SELECT:
        return (
          <ToggleSelector
            options={[1, 2, 3, 4, 5, 6]}
            onSelect={number => {
              database.write(() => {
                requisition.monthsToSupply = number;
                database.save('Requisition', requisition);
              });
              this.refreshData();
              this.closeModal();
            }}
            selected={requisition.monthsToSupply}
          />
        );
      case COMMENT_EDIT: {
        return (
          <TextEditor
            text={requisition.comment}
            onEndEditing={newComment => {
              if (newComment !== requisition.comment) {
                database.write(() => {
                  requisition.comment = newComment;
                  database.save('Requisition', requisition);
                });
              }
              this.closeModal();
            }}
          />
        );
      }
    }
  };

  renderButtons = () => {
    const { requisition } = this.props;

    return (
      <View style={globalStyles.pageTopRightSectionContainer}>
        <View style={globalStyles.verticalContainer}>
          <PageButton
            style={globalStyles.topButton}
            text={buttonStrings.create_automatic_order}
            onPress={this.onCreateAutomaticOrder}
            isDisabled={requisition.isFinalised}
          />
          <PageButton
            style={globalStyles.leftButton}
            text={buttonStrings.use_suggested_quantities}
            onPress={this.onUseSuggestedQuantities}
            isDisabled={requisition.isFinalised}
          />
        </View>
        <View style={globalStyles.verticalContainer}>
          <PageButton
            style={globalStyles.topButton}
            text={buttonStrings.new_item}
            onPress={() => this.openModal(MODAL_KEYS.ITEM_SELECT)}
            isDisabled={requisition.isFinalised}
          />
          <PageButton
            text={buttonStrings.add_master_list_items}
            onPress={this.onAddMasterItems}
            isDisabled={requisition.isFinalised}
          />
        </View>
      </View>
    );
  };

  renderExpansion = requisitionItem => {
    const { isVaccine } = this.state;
    if (!isVaccine) return null;
    const { database, requisition } = this.props;

    // Get date of most recent requisition.
    const prevRequisitionDate =
      database
        .objects('Requisition')
        .filtered('id != $0 && items.item.id = $1', requisition.id, requisitionItem.item.id)
        .max('entryDate') || new Date(null);

    // Get transactions for this item since most recent requisition.
    const transactionBatches = database
      .objects('TransactionBatch')
      .filtered('itemId = $0', requisitionItem.item.id);

    const recentTransactionBatches = transactionBatches.filtered(
      'transaction.confirmDate >= $0',
      prevRequisitionDate
    );

    // Get all customer invoices since most recent requisition.
    const transactionBatchesCI = recentTransactionBatches.filtered(
      'transaction.type = $0',
      'customer_invoice'
    );

    // Get all inventory adjustments since most recent requisition.
    const transactionBatchesIA = recentTransactionBatches.filtered(
      'transaction.type = $0',
      'supplier_credit'
    );

    // Calculate wastage.
    const doses = transactionBatchesCI.sum('doses');
    const dosesInVial = requisitionItem.item.doses;
    const openVialWastage = transactionBatchesCI.sum('numberOfPacks') * dosesInVial - doses;
    const closeVialWastage = transactionBatchesIA.sum('numberOfPacks') * dosesInVial;

    // Initialise columns for rendering expansion.
    const infoColumns = [
      [
        {
          title: `Previous Requisition Date:`,
          info:
            prevRequisitionDate > new Date(null)
              ? dateFormater(prevRequisitionDate, 'dd/mm/yy')
              : 'n/a',
        },
        {
          title: 'Doses Given:',
          info: doses,
        },
      ],
      [
        {
          title: `Open Vial Wastage (doses):`,
          info: openVialWastage,
        },
        {
          title: 'Close Vial Wastage (doses):',
          info: closeVialWastage,
        },
      ],
    ];

    return (
      <Expansion style={dataTableStyles.expansion}>
        <PageInfo columns={infoColumns} />
      </Expansion>
    );
  };

  render() {
    const { database, genericTablePageStyles, requisition, topRoute } = this.props;
    const { data, modalIsOpen, selection } = this.state;

    return (
      <GenericPage
        data={data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderExpansion={this.renderExpansion}
        renderTopLeftComponent={this.renderPageInfo}
        renderTopRightComponent={this.renderButtons}
        onEndEditing={this.onEndEditing}
        onSelectionChange={this.onSelectionChange}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'itemCode',
            width: 1.5,
            title: tableStrings.code,
            sortable: true,
          },
          {
            key: 'itemName',
            width: 4,
            title: tableStrings.item_name,
            sortable: true,
          },
          {
            key: 'stockOnHand',
            width: 2,
            title: tableStrings.current_stock,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'monthlyUsage',
            width: 2,
            title: tableStrings.monthly_usage,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'suggestedQuantity',
            width: 2,
            title: tableStrings.suggested_quantity,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'requiredQuantity',
            width: 2,
            title: tableStrings.required_quantity,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'remove',
            width: 1,
            title: tableStrings.remove,
            alignText: 'center',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        finalisableDataType="Requisition"
        database={database}
        selection={selection}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        {selection.length > 0 && !requisition.isFinalised && (
          <BottomConfirmModal
            isOpen={selection.length > 0 && !requisition.isFinalised}
            questionText={modalStrings.remove_these_items}
            onCancel={this.onDeleteCancel}
            onConfirm={this.onDeleteConfirm}
            confirmText={modalStrings.remove}
          />
        )}
        {modalIsOpen && !requisition.isFinalised && (
          <PageContentModal
            isOpen={modalIsOpen && !requisition.isFinalised}
            onClose={this.closeModal}
            title={this.getModalTitle()}
          >
            {this.renderModalContent()}
          </PageContentModal>
        )}
      </GenericPage>
    );
  }
}

/**
 * Check whether a given requisition is safe to be finalised. Return null if safe,
 * else return an appropriate error message.
 *
 * @param   {object}  requisition  The requisition to check.
 * @return  {string}               Null if safe to finalise, else an error message.
 */
export function checkForFinaliseError(requisition) {
  if (requisition.items.length === 0) {
    return modalStrings.add_at_least_one_item_before_finalising;
  }

  if (requisition.totalRequiredQuantity === 0) {
    return modalStrings.record_stock_required_before_finalising;
  }

  return null;
}

/* eslint-disable react/forbid-prop-types, react/require-default-props */
SupplierRequisitionPage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  requisition: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
};
