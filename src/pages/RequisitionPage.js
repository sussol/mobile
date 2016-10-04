/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { View } from 'react-native';

import { GenericTablePage } from './GenericTablePage';
import globalStyles from '../globalStyles';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';
import { createRecord } from '../database';
import { SETTINGS_KEYS } from '../settings';
import { buttonStrings, modalStrings, pageInfoStrings } from '../localization';
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

export class RequisitionPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.state.modalKey = null;
    this.columns = COLUMNS;
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.finalisableDataType = 'Requisition';
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onAddMasterItems = this.onAddMasterItems.bind(this);
    this.onCreateAutomaticOrder = this.onCreateAutomaticOrder.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onUseSuggestedQuantities = this.onUseSuggestedQuantities.bind(this);
    this.renderPageInfo = this.renderPageInfo.bind(this);
    this.openMonthsSelector = this.openMonthsSelector.bind(this);
    this.openItemSelector = this.openItemSelector.bind(this);
    this.openCommentEditor = this.openCommentEditor.bind(this);
    this.getModalTitle = this.getModalTitle.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
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
    return sortDataBy(data, sortBy, sortDataType, isAscending);
  }

  onAddMasterItems() {
    this.props.runWithLoadingIndicator(() => {
      this.props.database.write(() => {
        this.props.requisition.addItemsFromMasterList(this.props.database, this.getThisStore());
        this.props.database.save('Requisition', this.props.requisition);
      });
      this.refreshData();
    });
  }

  onCreateAutomaticOrder() {
    this.props.runWithLoadingIndicator(() => {
      this.props.database.write(() => {
        this.props.requisition.createAutomaticOrder(this.props.database, this.getThisStore());
        this.props.database.save('Requisition', this.props.requisition);
      });
      this.refreshData();
    });
  }

  getThisStore() {
    const thisStoreNameId = this.props.settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID);
    const nameResults = this.props.database.objects('Name')
                                           .filtered('id == $0', thisStoreNameId);
    if (!nameResults | nameResults.length <= 0) return null;
    return nameResults[0];
  }

  /**
   * Respond to the user editing the number in the required quantity column
   * @param  {string} key             Should always be 'requiredQuantity'
   * @param  {object} requisitionItem The requisition item from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, requisitionItem, newValue) {
    if (key !== 'requiredQuantity') return;
    this.props.database.write(() => {
      requisitionItem.requiredQuantity = parsePositiveInteger(newValue);
      this.props.database.save('RequisitionItem', requisitionItem);
    });
  }

  onDeleteConfirm() {
    const { selection } = this.state;
    const { requisition, database } = this.props;
    database.write(() => {
      requisition.removeItemsById(database, selection);
      database.save('Requisition', requisition);
    });
    this.setState({ selection: [] });
    this.refreshData();
  }

  onDeleteCancel() {
    this.setState({ selection: [] });
    this.refreshData();
  }

  onUseSuggestedQuantities() {
    this.props.runWithLoadingIndicator(() => {
      const { database, requisition } = this.props;
      database.write(() => {
        requisition.setRequestedToSuggested(database);
        database.save('Requisition', requisition);
      });
      this.refreshData();
    });
  }

  openItemSelector() {
    this.openModal(MODAL_KEYS.ITEM_SELECT);
  }

  openMonthsSelector() {
    this.openModal(MODAL_KEYS.MONTHS_SELECT);
  }

  openCommentEditor() {
    this.openModal(MODAL_KEYS.COMMENT_EDIT);
  }

  getModalTitle() {
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

  renderPageInfo() {
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(this.props.requisition.entryDate),
        },
        {
          title: `${pageInfoStrings.entered_by}:`,
          info: this.props.requisition.enteredByName,
        },
      ],
      [
        {
          title: `${pageInfoStrings.months_stock_required}:`,
          info: Math.round(this.props.requisition.monthsToSupply),
          onPress: this.openMonthsSelector,
          editableType: 'selectable',
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: this.props.requisition.comment,
          onPress: this.openCommentEditor,
          editableType: 'text',
        },
      ],
    ];
    return (
      <PageInfo
        columns={infoColumns}
        isEditingDisabled={this.props.requisition.isFinalised}
      />
    );
  }

  renderCell(key, requisitionItem) {
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

  renderModalContent() {
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

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderPageInfo()}
              {this.renderSearchBar()}
            </View>
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
          </View>
          {this.renderDataTable()}
          <BottomConfirmModal
            isOpen={this.state.selection.length > 0 && !this.props.requisition.isFinalised}
            questionText={modalStrings.remove_these_items}
            onCancel={() => this.onDeleteCancel()}
            onConfirm={() => this.onDeleteConfirm()}
            confirmText={modalStrings.remove}
          />
          <PageContentModal
            isOpen={this.state.pageContentModalIsOpen && !this.props.requisition.isFinalised}
            onClose={this.closeModal}
            title={this.getModalTitle()}
          >
            {this.renderModalContent()}
          </PageContentModal>
        </View>
      </View>
    );
  }
}

RequisitionPage.propTypes = {
  database: React.PropTypes.object,
  requisition: React.PropTypes.object,
  settings: React.PropTypes.object,
};

const COLUMNS = [
  {
    key: 'itemCode',
    width: 1.5,
    titleKey: 'code',
    sortable: true,
  },
  {
    key: 'itemName',
    width: 4,
    titleKey: 'item_name',
    sortable: true,
  },
  {
    key: 'stockOnHand',
    width: 2,
    titleKey: 'current_stock',
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'monthlyUsage',
    width: 2,
    titleKey: 'monthly_usage',
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'suggestedQuantity',
    width: 2,
    titleKey: 'suggested_quantity',
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'requiredQuantity',
    width: 2,
    titleKey: 'required_quantity',
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'remove',
    width: 1,
    titleKey: 'remove',
    alignText: 'center',
  },
];

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
