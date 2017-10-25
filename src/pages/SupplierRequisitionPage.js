/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { GenericPage } from './GenericPage';
import globalStyles from '../globalStyles';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';
import { createRecord } from '../database';
import { SETTINGS_KEYS } from '../settings';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageInfo,
  PageContentModal,
  TextEditor,
  ToggleSelector,
} from '../widgets';

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

  onAddMasterItems = () => {
    this.props.runWithLoadingIndicator(() => {
      this.props.database.write(() => {
        this.props.requisition.addItemsFromMasterList(this.props.database, this.getThisStore());
        this.props.database.save('Requisition', this.props.requisition);
      });
      this.refreshData();
    });
  }

  onCreateAutomaticOrder = () => {
    this.props.runWithLoadingIndicator(() => {
      this.props.database.write(() => {
        this.props.requisition.createAutomaticOrder(this.props.database, this.getThisStore());
        this.props.database.save('Requisition', this.props.requisition);
      });
      this.refreshData();
    });
  }

  /**
   * Respond to the user editing the number in the required quantity column
   * @param  {string} key             Should always be 'requiredQuantity'
   * @param  {object} requisitionItem The requisition item from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing = (key, requisitionItem, newValue) => {
    if (key !== 'requiredQuantity') return;
    this.props.database.write(() => {
      requisitionItem.requiredQuantity = parsePositiveInteger(newValue);
      this.props.database.save('RequisitionItem', requisitionItem);
    });
  }

  onDeleteConfirm = () => {
    const { selection } = this.state;
    const { requisition, database } = this.props;
    database.write(() => {
      requisition.removeItemsById(database, selection);
      database.save('Requisition', requisition);
    });
    this.setState({ selection: [] });
    this.refreshData();
  }

  onDeleteCancel = () => {
    this.setState({ selection: [] });
    this.refreshData();
  }

  onUseSuggestedQuantities = () => {
    this.props.runWithLoadingIndicator(() => {
      const { database, requisition } = this.props;
      database.write(() => {
        requisition.setRequestedToSuggested(database);
        database.save('Requisition', requisition);
      });
      this.refreshData();
    });
  }

  onSelectionChange = (newSelection) => this.setState({ selection: newSelection });

  getThisStore = () => {
    const thisStoreNameId = this.props.settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID);
    const nameResults = this.props.database.objects('Name')
                                           .filtered('id == $0', thisStoreNameId);
    if (!nameResults | nameResults.length <= 0) return null;
    return nameResults[0];
  }

  getModalTitle = () => {
    const { ITEM_SELECT, COMMENT_EDIT, MONTHS_SELECT } = MODAL_KEYS;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return modalStrings.search_for_an_item_to_add;
      case COMMENT_EDIT:
        return modalStrings.edit_the_requisition_comment;
      case MONTHS_SELECT:
        return modalStrings.select_the_number_of_months_stock_required;
    }
  }

  updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const data = this.props.requisition.items
                 .filtered('item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0', searchTerm);
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
    this.setState({ data: sortDataBy(data, sortBy, sortDataType, isAscending) });
  }

  openModal = (key) => this.setState({ modalKey: key, modalIsOpen: true });

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
    return (
      <PageInfo
        columns={infoColumns}
        isEditingDisabled={requisition.isFinalised}
      />
    );
  }

  renderCell = (key, requisitionItem) => {
    switch (key) {
      default:
        return requisitionItem[key];
      case 'monthlyUsage':
      case 'suggestedQuantity':
        return Math.round(requisitionItem[key]);
      case 'requiredQuantity':
        return {
          type: this.props.requisition.isFinalised ? 'text' : 'editable',
          cellContents: Math.round(requisitionItem.requiredQuantity),
        };
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: this.props.requisition.isFinalised,
        };
    }
  }

  renderModalContent = () => {
    const { COMMENT_EDIT, ITEM_SELECT, MONTHS_SELECT } = MODAL_KEYS;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={this.props.database.objects('Item')}
            queryString={'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'}
            queryStringSecondary={'name CONTAINS[c] $0'}
            sortByString={'name'}
            onSelect={(item) => {
              const { database, requisition } = this.props;
              database.write(() => {
                if (!requisition.hasItemWithId(item.id)) {
                  createRecord(database, 'RequisitionItem', requisition, item);
                  database.save('Requisition', requisition);
                }
              });
              this.refreshData();
              this.closeModal();
            }}
            renderLeftText={(item) => `${item.name}`}
            renderRightText={(item) => `${item.totalQuantity}`}
          />
        );
      case MONTHS_SELECT:
        return (
          <ToggleSelector
            options={[1, 2, 3, 4, 5, 6]}
            onSelect={(number) => {
              this.props.database.write(() => {
                this.props.requisition.monthsToSupply = number;
                this.props.database.save('Requisition', this.props.requisition);
              });
              this.refreshData();
              this.closeModal();
            }}
            selected={this.props.requisition.monthsToSupply}
          />
          );
      case COMMENT_EDIT:
        return (
          <TextEditor
            text={this.props.requisition.comment}
            onEndEditing={(newComment) => {
              if (newComment !== this.props.requisition.comment) {
                this.props.database.write(() => {
                  this.props.requisition.comment = newComment;
                  this.props.database.save('Requisition', this.props.requisition);
                });
              }
              this.closeModal();
            }}
          />
          );
    }
  }

  renderButtons = () => (
    <View style={globalStyles.pageTopRightSectionContainer}>
      <View style={globalStyles.verticalContainer}>
        <PageButton
          style={globalStyles.topButton}
          text={buttonStrings.create_automatic_order}
          onPress={this.onCreateAutomaticOrder}
          isDisabled={this.props.requisition.isFinalised}
        />
        <PageButton
          style={globalStyles.leftButton}
          text={buttonStrings.use_suggested_quantities}
          onPress={this.onUseSuggestedQuantities}
          isDisabled={this.props.requisition.isFinalised}
        />
      </View>
      <View style={globalStyles.verticalContainer}>
        <PageButton
          style={globalStyles.topButton}
          text={buttonStrings.new_item}
          onPress={() => this.openModal(MODAL_KEYS.ITEM_SELECT)}
          isDisabled={this.props.requisition.isFinalised}
        />
        <PageButton
          text={buttonStrings.add_master_list_items}
          onPress={this.onAddMasterItems}
          isDisabled={this.props.requisition.isFinalised}
        />
      </View>
    </View>
  );


  render = () => (
    <GenericPage
      data={this.state.data}
      refreshData={this.refreshData}
      renderCell={this.renderCell}
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
      finalisableDataType={'Requisition'}
      database={this.props.database}
      selection={this.state.selection}
      {...this.props.genericTablePageStyles}
      topRoute={this.props.topRoute}
    >
      <BottomConfirmModal
        isOpen={this.state.selection.length > 0 && !this.props.requisition.isFinalised}
        questionText={modalStrings.remove_these_items}
        onCancel={this.onDeleteCancel}
        onConfirm={this.onDeleteConfirm}
        confirmText={modalStrings.remove}
      />
      <PageContentModal
        isOpen={this.state.modalIsOpen && !this.props.requisition.isFinalised}
        onClose={this.closeModal}
        title={this.getModalTitle()}
      >
        {this.renderModalContent()}
      </PageContentModal>
    </GenericPage>
  );
}

SupplierRequisitionPage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  requisition: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
};

/**
 * Check whether a given requisition is safe to be finalised. Return null if it is,
 * otherwise return an appropriate error message if not.
 * @param  {object}  requisition  The requisition to check
 * @return {string}  An error message if not able to be finalised
 */
export function checkForFinaliseError(requisition) {
  if (requisition.items.length === 0) {
    return modalStrings.add_at_least_one_item_before_finalising;
  } else if (requisition.totalRequiredQuantity === 0) {
    return modalStrings.record_stock_required_before_finalising;
  }
  return null;
}
