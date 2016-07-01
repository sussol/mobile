/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import { View } from 'react-native';

import { generateUUID } from '../database';
import { Button } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';

const DATA_TYPES_DISPLAYED = ['Requisition', 'RequisitionLine'];

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

  onNewRequisition() {
    let requisition;
    this.props.database.write(() => {
      requisition = this.props.database.create('Requisition', {
        id: generateUUID(),
        status: 'new',
        type: 'request',
        entryDate: new Date(),
        daysToSupply: 90, // 3 months
        serialNumber: (Math.floor(Math.random() * 1000000)).toString(),
        user: this.props.currentUser,
      });
    });
    this.navigateToRequisition(requisition);
  }

  onRowPress(requisition) {
    this.navigateToRequisition(requisition);
  }

  navigateToRequisition(requisition) {
    this.props.navigateTo(
      'requisition',
      `Requisition ${requisition.serialNumber}`,
      { requisition },
    );
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending. Special case for
   * 'serialNumber' to sort numbers correctly. Special case for lines.length for correct number
   * sort and also realm does not allow sorting on the properties of an object property.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.state.requisitions.filtered(`serialNumber BEGINSWITH "${searchTerm}"`);
    switch (sortBy) {
      case 'serialNumber': // Special case for correct number based sorting
        // Convert to javascript array obj then sort with standard array functions.
        data = data.slice().sort((a, b) => Number(a.serialNumber) - b.serialNumber); // 0,1,2,3...
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
        return requisition.status;
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            {this.renderSearchBar()}
            <Button
              style={globalStyles.button}
              textStyle={globalStyles.buttonText}
              text="New Requisition"
              onPress={this.onNewRequisition}
            />
          </View>
          {this.renderDataTable()}
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
    title: 'REQUISITION NO.',
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
    title: 'AMOUNT OF ITEMS',
    sortable: true,
  },
  {
    key: 'status',
    width: 1,
    title: 'STATUS',
    sortable: true,
  },
];
