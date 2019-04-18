/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GenericPage } from './GenericPage';
import { BottomConfirmModal, PageButton, SelectModal, ByProgramModal } from '../widgets';

import { createRecord } from '../database';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';
import { formatStatus, sortDataBy, getAllPrograms } from '../utilities';

import { SETTINGS_KEYS } from '../settings';

const { THIS_STORE_CUSTOM_DATA } = SETTINGS_KEYS;

const DATA_TYPES_SYNCHRONISED = ['Requisition'];

/**
 * Renders the page for displaying supplier requisitions (requests from this store to a
 * supplying store).
 *
 * @prop {Realm}         database     App database.
 * @prop {func}          navigateTo   CallBack for navigation stack.
 * @prop {Realm.Object}  currentUser  User object representing the current user logged in.
 */
export class SupplierRequisitionsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: [],
      isCreatingRequisition: false,
      byProgramModalOpen: false,
      usesPrograms: false,
    };
    this.requisitions = props.database.objects('RequestRequisition');
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'serialNumber',
      isAscending: false,
    };
  }

  componentDidMount() {
    const { settings, database } = this.props;
    this.setState({ usesPrograms: getAllPrograms(settings, database).length > 0 });
  }

  onDelete = shouldConfirm => () => {
    const { selection } = this.state;
    const { database } = this.props;

    if (shouldConfirm) {
      database.write(() => {
        const requisitionsToDelete = [];
        for (let i = 0; i < selection.length; i += 1) {
          const requisition = this.requisitions.find(
            currentRequisition => currentRequisition.id === selection[i]
          );
          if (requisition.isValid() && !requisition.isFinalised) {
            requisitionsToDelete.push(requisition);
          }
        }
        database.delete('Requisition', requisitionsToDelete);
      });
    }

    this.setState({ selection: [] });
    this.refreshData();
  };

  onNewRequisition = requisitionValues => {
    const { database, currentUser, settings } = this.props;

    let requisition;
    if (!requisitionValues) {
      this.setState({ byProgramModalOpen: false, isCreatingRequisition: false });
      return;
    }
    database.write(() => {
      const customData = JSON.parse(settings.get(THIS_STORE_CUSTOM_DATA));
      const monthsLeadTime = customData.monthsLeadTime ? Number(customData.monthsLeadTime.data) : 0;

      requisition = createRecord(database, 'Requisition', currentUser, {
        ...requisitionValues,
        monthsLeadTime,
      });
      if (requisition.program) requisition.addItemsFromProgram(database);
    });
    this.navigateToRequisition(requisition);
  };

  onRowPress = requisition => this.navigateToRequisition(requisition);

  onSelectionChange = newSelection => this.setState({ selection: newSelection });

  navigateToRequisition = requisition => {
    const { navigateTo } = this.props;
    // Clear any requsitions selected to delete.
    this.setState({ selection: [], byProgramModalOpen: false });
    navigateTo('supplierRequisition', `${navStrings.requisition} ${requisition.serialNumber}`, {
      requisition,
    });
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
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const data = this.requisitions.filtered('serialNumber BEGINSWITH $0', searchTerm);
    let sortDataType;
    switch (sortBy) {
      case 'serialNumber':
      case 'numberOfItems':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({
      data: sortDataBy(data, sortBy, sortDataType, isAscending),
    });
  };

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
  };

  renderNewRequisitionButton = () => {
    const { usesPrograms } = this.state;
    const newState = usesPrograms ? { byProgramModalOpen: true } : { isCreatingRequisition: true };
    return (
      <PageButton text={buttonStrings.new_requisition} onPress={() => this.setState(newState)} />
    );
  };

  render() {
    const { database, genericTablePageStyles, topRoute, settings } = this.props;
    const { data, isCreatingRequisition, selection, byProgramModalOpen } = this.state;
    return (
      <GenericPage
        data={data}
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
        database={database}
        selection={selection}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        <BottomConfirmModal
          isOpen={selection.length > 0}
          questionText={modalStrings.delete_these_invoices}
          onCancel={this.onDelete(false)}
          onConfirm={this.onDelete(true)}
          confirmText={modalStrings.delete}
        />

        <SelectModal
          isOpen={isCreatingRequisition}
          options={database.objects('InternalSupplier')}
          placeholderText={modalStrings.start_typing_to_select_supplier}
          queryString="name BEGINSWITH[c] $0"
          sortByString="name"
          onSelect={name => this.onNewRequisition({ otherStoreName: name })}
          onClose={this.onNewRequisition}
          title={modalStrings.search_for_the_supplier}
        />

        {byProgramModalOpen && (
          <ByProgramModal
            isOpen={byProgramModalOpen}
            onConfirm={this.onNewRequisition}
            onCancel={this.onNewRequisition}
            database={database}
            type="requisition"
            settings={settings}
          />
        )}
      </GenericPage>
    );
  }
}

export default SupplierRequisitionsPage;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
SupplierRequisitionsPage.propTypes = {
  database: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
};
