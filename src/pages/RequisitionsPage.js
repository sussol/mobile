/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import { View } from 'react-native';

import { createRecord } from '../database';
import { BottomConfirmModal, PageButton } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';
import { formatStatus } from '../utilities';

const DATA_TYPES_DISPLAYED = ['Requisition', 'RequisitionItem'];

/**
* Renders the page for displaying Requisitions.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @prop   {Realm.Object}        currentUser   User object representing the current user logged in.
* @state  {Realm.Results}       requisitions  Results object containing all Requisition records.
*/
export class RequisitionsPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.requisitions = props.database.objects('Requisition');
    this.state.sortBy = 'serialNumber';
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onNewRequisition = this.onNewRequisition.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
    this.renderCell = this.renderCell.bind(this);
    this.navigateToRequisition = this.navigateToRequisition.bind(this);
  }

  onDeleteConfirm() {
    const { selection, requisitions } = this.state;
    const { database } = this.props;
    database.write(() => {
      const requisitionsToDelete = [];
      for (let i = 0; i < selection.length; i++) {
        const requisition = requisitions.find(currentRequisition =>
                                                currentRequisition.id === selection[i]);
        if (requisition.isValid() && !requisition.isFinalised) {
          requisitionsToDelete.push(requisition);
        }
      }
      database.delete('Requisition', requisitionsToDelete);
    });
    this.setState({ selection: [] });
    this.refreshData();
  }

  onDeleteCancel() {
    this.setState({ selection: [] });
    this.refreshData();
  }

  onNewRequisition() {
    let requisition;
    this.props.database.write(() => {
      requisition = createRecord(this.props.database, 'Requisition', this.props.currentUser);
    });
    this.navigateToRequisition(requisition);
  }

  onRowPress(requisition) {
    this.navigateToRequisition(requisition);
  }

  navigateToRequisition(requisition) {
    this.setState({ selection: [] }); // Clear any requsitions selected for delete
    this.props.navigateTo(
      'requisition',
      `Requisition ${requisition.serialNumber}`,
      { requisition: requisition },
    );
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending. Special case for
   * 'serialNumber' to sort numbers correctly. Special case for items.length for correct number
   * sort and also realm does not allow sorting on the properties of an object property.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.state.requisitions.filtered('serialNumber BEGINSWITH $0', searchTerm);
    switch (sortBy) {
      case 'serialNumber': // Special case for correct number based sorting
        // Convert to javascript array obj then sort with standard array functions.
        data = data.slice().sort((a, b) =>
          Number(a.serialNumber) - Number(b.serialNumber)); // 0,1,2,3...
        if (!isAscending) data.reverse(); // ...3,2,1,0
        break;
      case 'numberOfItems': // Cannot use realm Result.sorted() with a property of a property
        data = data.slice().sort((a, b) => a.items.length - b.items.length); // 0,1,2,3...
        if (!isAscending) data.reverse(); // ...3,2,1,0
        break;
      default:
        data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
    }

    return data;
  }

  renderCell(key, requisition) {
    switch (key) {
      default:
      case 'serialNumber':
        return requisition.serialNumber;
      case 'entryDate':
        return requisition.entryDate.toDateString();
      case 'numberOfItems':
        return requisition.items.length;
      case 'status':
        return formatStatus(requisition.status);
      case 'delete':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: requisition.isFinalised,
        };
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderSearchBar()}
            </View>
            <PageButton
              text="New Requisition"
              onPress={this.onNewRequisition}
            />
          </View>
          {this.renderDataTable()}
          <BottomConfirmModal
            isOpen={this.state.selection.length > 0}
            questionText="Are you sure you want to delete these requsitions?"
            onCancel={() => this.onDeleteCancel()}
            onConfirm={() => this.onDeleteConfirm()}
            confirmText="Delete"
          />
        </View>
      </View>
    );
  }
}

RequisitionsPage.propTypes = {
  database: React.PropTypes.object.isRequired,
  currentUser: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'serialNumber',
    width: 2,
    title: 'REQUISITION NUM.',
    sortable: true,
  },
  {
    key: 'entryDate',
    width: 1,
    title: 'DATE ENTERED',
    sortable: true,
  },
  {
    key: 'numberOfItems',
    width: 1,
    title: 'ITEMS',
    sortable: true,
  },
  {
    key: 'status',
    width: 1,
    title: 'STATUS',
    sortable: true,
  },
  {
    key: 'delete',
    width: 1,
    title: 'DELETE',
  },
];
