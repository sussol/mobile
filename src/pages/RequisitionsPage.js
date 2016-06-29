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

const DATA_TYPES_DISPLAYED = ['Transaction', 'TransactionLine'];

/**
* Renders the page for displaying Requisitions.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
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
  }

  onNewRequisition() {
    let requisition;
    this.props.database.write(() => {
      requisition = this.props.database.create('Requisition', {
        id: generateUUID(),
        status: 'new',
        type: 'request', // imprest or forecast
        entryDate: new Date(),
        daysToSupply: 90,
        serialNumber: (Math.floor(Math.random() * 1000000)).toString(),
        user: this.props.currentUser,
      });
    });
    this.props.navigateTo('requisition', `Requisition ${requisition.serialNumber}`, {
      requisition: requisition,
    });
  }

  onRowPress(requisition) {
    this.props.navigateTo(
      'requisition',
      `Requisition ${requisition.serialNumber}`,
      { requisition },
    );
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending. Special
   * case for otherParty.name as realm does not allow sorting on object properties
   * properties.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.state.requisitions.filtered(`serialNumber CONTAINS[c] "${searchTerm}"`);
    data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
    return data;
  }

  renderCell(key, requisition) {
    switch (key) {
      default:
      case 'serialNumber':
        return requisition.lines;
      case 'entryDate':
        return requisition.entryDate.toDateString();
      case 'lines.length':
        return requisition.lines.length;
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
  database: React.PropTypes.object,
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
    key: 'lines.length',
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
