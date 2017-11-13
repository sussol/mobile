/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';

import { createRecord } from '../../database';
import { BottomConfirmModal, PageButton, SelectModal } from '../../widgets';
import { GenericPage } from '../GenericPage';
import { formatStatus, sortDataBy } from '../../utilities';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../../localization';

const DATA_TYPES_SYNCHRONISED = ['Requisition'];

/**
* Renders the page for displaying Supplier Requisitions, i.e. requests from this store to a
* supplying store
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @prop   {Realm.Object}        currentUser   User object representing the current user logged in.
*/
export class SupplierRequisitionsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: [],
      isCreatingRequisition: false,
    };
    this.requisitions = props.database.objects('RequestRequisition');
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'serialNumber',
      isAscending: false,
    };
  }

  onDeleteConfirm = () => {
    const { selection } = this.state;
    const { database } = this.props;
    database.write(() => {
      const requisitionsToDelete = [];
      for (let i = 0; i < selection.length; i++) {
        const requisition = this.requisitions.find(
          currentRequisition => currentRequisition.id === selection[i]
        );
        if (requisition.isValid() && !requisition.isFinalised) {
          requisitionsToDelete.push(requisition);
        }
      }
      database.delete('Requisition', requisitionsToDelete);
    });
    this.setState({ selection: [] });
    this.refreshData();
  }

  onDeleteCancel = () => {
    this.setState({ selection: [] });
    this.refreshData();
  }

  onNewRequisition = (otherStoreName) => {
    let requisition;
    this.props.database.write(() => {
      requisition = createRecord(this.props.database,
                                'Requisition', this.props.currentUser, otherStoreName);
    });
    this.navigateToRequisition(requisition);
  }

  onRowPress = (requisition) => this.navigateToRequisition(requisition);

  onSelectionChange = (newSelection) => this.setState({ selection: newSelection });

  navigateToRequisition = (requisition) => {
    this.setState({ selection: [] }); // Clear any requsitions selected for delete
    this.props.navigateTo(
      'supplierRequisition',
      `${navStrings.requisition} ${requisition.serialNumber}`,
      { requisition: requisition },
    );
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
    const data =
        this.requisitions.filtered('serialNumber BEGINSWITH $0', searchTerm);
    let sortDataType;
    switch (sortBy) {
      case 'serialNumber':
      case 'numberOfItems':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({ data: sortDataBy(data, sortBy, sortDataType, isAscending) });
  }

  renderCell = (key, requisition) => {
    switch (key) {
      case 'entryDate':
        return requisition.entryDate.toDateString();
      case 'supplierName':
        return requisition.otherStoreName ? requisition.otherStoreName.name : '';
      case 'status':
        return formatStatus(requisition.status);
      case 'delete':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: requisition.isFinalised,
        };
      default:
        return requisition[key];
    }
  }

  renderNewRequisitionButton = () => (
    <PageButton
      text={buttonStrings.new_requisition}
      onPress={() => {
        this.setState({ isCreatingRequisition: true });
      }}
    />
  )


  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopRightComponent={this.renderNewRequisitionButton}
        onRowPress={this.onRowPress}
        onSelectionChange={this.onSelectionChange}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'serialNumber',
            width: 1.5,
            title: tableStrings.requisition_number,
            sortable: true,
          },
          {
            key: 'supplierName',
            width: 2,
            title: tableStrings.supplier,
            sortable: false,
          },
          {
            key: 'entryDate',
            width: 1,
            title: tableStrings.entered_date,
            sortable: true,
          },
          {
            key: 'numberOfItems',
            width: 1,
            title: tableStrings.items,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'status',
            width: 1,
            title: tableStrings.status,
            sortable: true,
          },
          {
            key: 'delete',
            width: 1,
            title: tableStrings.delete,
            alignText: 'center',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        database={this.props.database}
        selection={this.state.selection}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      >
        <BottomConfirmModal
          isOpen={this.state.selection.length > 0}
          questionText={modalStrings.delete_these_invoices}
          onCancel={() => this.onDeleteCancel()}
          onConfirm={() => this.onDeleteConfirm()}
          confirmText={modalStrings.delete}
        />
        <SelectModal
          isOpen={this.state.isCreatingRequisition}
          options={this.props.database.objects('InternalSupplier')}
          placeholderText={modalStrings.start_typing_to_select_supplier}
          queryString={'name BEGINSWITH[c] $0'}
          sortByString={'name'}
          onSelect={name => {
            this.setState({ isCreatingRequisition: false }, () => {
              this.onNewRequisition(name);
            });
          }}
          onClose={() => this.setState({ isCreatingRequisition: false })}
          title={modalStrings.search_for_the_supplier}
        />
      </GenericPage>
    );
  }
}

SupplierRequisitionsPage.propTypes = {
  database: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
};
