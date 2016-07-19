/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { GenericTablePage } from './GenericTablePage';
import globalStyles from '../globalStyles';
import { formatDate, parsePositiveInteger } from '../utilities';
import { createRecord } from '../database';
import { SETTINGS_KEYS } from '../settings';
import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageInfo,
  PageContentModal,
  ToggleSelector,
} from '../widgets';

const DATA_TYPES_DISPLAYED =
        ['Requisition', 'RequisitionItem', 'Item', 'ItemBatch'];
const MODAL_KEYS = {
  ITEM_SELECT: 'itemSelect',
  MONTHS_SELECT: 'monthsSelect',
};

export class RequisitionPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.state.modalKey = null;
    this.state.pageContentModalIsOpen = false;
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onAddMasterItems = this.onAddMasterItems.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onUseSuggestedQuantities = this.onUseSuggestedQuantities.bind(this);
    this.renderPageInfo = this.renderPageInfo.bind(this);
    this.openMonthsSelector = this.openMonthsSelector.bind(this);
    this.openItemSelector = this.openItemSelector.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.props.requisition.items.filtered('item.name BEGINSWITH[c] $0', searchTerm);
    switch (sortBy) {
      case 'itemCode':
        data = data.slice().sort((a, b) =>
          a.item.code.localeCompare(b.item.code));
        if (!isAscending) data.reverse();
        break;
      case 'itemName':
        data = data.slice().sort((a, b) =>
          a.item.name.localeCompare(b.item.name));
        if (!isAscending) data.reverse();
        break;
      default:
        data = data.sorted(sortBy, !isAscending);
        break;
    }
    return data;
  }

  onAddMasterItems() {
    this.props.database.write(() => {
      const thisStoreNameId = this.props.settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID);
      const nameResults = this.props.database.objects('Name').filtered('id == $0', thisStoreNameId);
      if (!nameResults | nameResults.length <= 0) return;
      const thisStore = nameResults[0];
      this.props.requisition.addItemsFromMasterList(this.props.database, thisStore);
      this.props.database.save('Requisition', this.props.requisition);
    });
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
    const { database, requisition } = this.props;
    database.write(() => {
      requisition.setRequestedToSuggested(database);
      database.save('Requisition', requisition);
    });
  }

  openItemSelector() {
    this.openModal(MODAL_KEYS.ITEM_SELECT);
  }

  openMonthsSelector() {
    this.openModal(MODAL_KEYS.MONTHS_SELECT);
  }

  openModal(key) {
    this.setState({ modalKey: key, pageContentModalIsOpen: true });
  }

  closeModal() {
    this.setState({ pageContentModalIsOpen: false });
  }

  renderPageInfo() {
    const infoColumns = [
      [
        {
          title: 'Entry Date:',
          info: formatDate(this.props.requisition.entryDate),
        },
        {
          title: 'Entered By:',
          info: this.props.requisition.enteredByName,
        },
      ],
      [
        {
          title: 'Months Stock Required:',
          info: this.props.requisition.monthsToSupply,
          onPress: this.openMonthsSelector,
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
      case 'requiredQuantity':
        return {
          cellContents: requisitionItem.requiredQuantity,
          type: this.props.requisition.isFinalised ? 'text' : 'editable',
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
    const { ITEM_SELECT, MONTHS_SELECT } = MODAL_KEYS;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={this.props.database.objects('Item')}
            queryString={'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'}
            onSelect={(item) => {
              this.props.database.write(() => {
                createRecord(this.props.database, 'RequisitionItem', this.props.requisition, item);
                this.props.database.save('Requisition', this.props.requisition);
              });
              this.closeModal();
            }}
          />
        );
      case MONTHS_SELECT:
        return (
          <ToggleSelector
            options={[1, 2, 3, 4, 5, 6]}
            onSelect={(number) => {
              this.props.database.write(() => {
                this.props.requisition.monthsToSupply = number;
              });
              this.closeModal();
            }}
            selected={this.props.requisition.monthsToSupply}
          />
          );
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.verticalContainer}>
              {this.renderPageInfo()}
              {this.renderSearchBar()}
            </View>
            <View style={globalStyles.verticalContainer}>
              <PageButton
                text="Use Suggested Quantities"
                onPress={this.onUseSuggestedQuantities}
                isDisabled={this.props.requisition.isFinalised}
              />
            </View>
            <View style={globalStyles.verticalContainer}>
              <PageButton
                style={localStyles.topButton}
                text="New Item"
                onPress={() => this.openModal(MODAL_KEYS.ITEM_SELECT)}
                isDisabled={this.props.requisition.isFinalised}
              />
              <PageButton
                text="Add Master List Items"
                onPress={this.onAddMasterItems}
                isDisabled={this.props.requisition.isFinalised}
              />
            </View>
          </View>
          {this.renderDataTable()}
          <BottomConfirmModal
            isOpen={this.state.selection.length > 0 && !this.props.requisition.isFinalised}
            questionText="Are you sure you want to remove these items?"
            onCancel={() => this.onDeleteCancel()}
            onConfirm={() => this.onDeleteConfirm()}
            confirmText="Remove"
          />
          <PageContentModal
            isOpen={this.state.pageContentModalIsOpen && !this.props.requisition.isFinalised}
            onClose={this.closeModal}
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
    width: 2,
    title: 'CODE',
    sortable: true,
  },
  {
    key: 'itemName',
    width: 4,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'stockOnHand',
    width: 2,
    title: 'CURRENT STOCK',
    sortable: true,
  },
  {
    key: 'monthlyUsage',
    width: 2,
    title: 'MONTHLY USE',
  },
  {
    key: 'suggestedQuantity',
    width: 2,
    title: 'SUGGESTED QTY',
  },
  {
    key: 'requiredQuantity',
    width: 2,
    title: 'REQUESTED QTY',
  },
  {
    key: 'remove',
    width: 1,
    title: 'REMOVE',
  },
];

const localStyles = StyleSheet.create({
  topButton: {
    marginBottom: 10,
  },
});
