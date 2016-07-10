/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  View,
} from 'react-native';

import { GenericTablePage } from './GenericTablePage';
import globalStyles from '../globalStyles';
import { BottomConfirmModal, PageButton, PageInfo, SelectModal } from '../widgets';
import { formatDate, parsePositiveNumber } from '../utilities';
import { createRecord } from '../database';
import { SETTINGS_KEYS } from '../settings';

const DATA_TYPES_DISPLAYED =
        ['Requisition', 'RequisitionItem', 'Item', 'ItemBatch'];

export class RequisitionPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.state.isAddingNewItem = false;
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onAddMasterItems = this.onAddMasterItems.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.renderPageInfo = this.renderPageInfo.bind(this);
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
      requisitionItem.requiredQuantity = parsePositiveNumber(newValue);
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
    ];
    return <PageInfo columns={infoColumns} />;
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
                text="New Item"
                onPress={() => this.setState({ isAddingNewItem: true })}
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
          <SelectModal
            isOpen={this.state.isAddingNewItem && !this.props.requisition.isFinalised}
            options={this.props.database.objects('Item')}
            queryString={'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'}
            onSelect={(item) => {
              this.props.database.write(() => {
                createRecord(this.props.database, 'RequisitionItem', this.props.requisition, item);
                this.props.database.save('Requisition', this.props.requisition);
              });
              this.setState({ isAddingNewItem: false });
            }}
            onCancel={() => this.setState({ isAddingNewItem: false })}
          />
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
