/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';

import { GenericPage } from './GenericPage';
import { PageContentModal } from '../widgets/modals';
import { PageButton, PageInfo, TextEditor } from '../widgets';

import { formatDate, sortDataBy } from '../utilities';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';

import globalStyles from '../globalStyles';

const DATA_TYPES_SYNCHRONISED = ['RequisitionItem', 'Item', 'ItemBatch'];

const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  ITEM_SELECT: 'itemSelect',
  MONTHS_SELECT: 'monthsSelect',
};

/**
 * Check whether a given requisition is safe to be finalised.
 * If requisition is safe to finalise, return null, else return
 * an appropriate error message.
 *
 * @param   {object}  requisition  The requisition to check
 * @return  {string}               An error message if not able
 *                                 to be finalised
 *
 * TODO: implement method body.
 */
export const checkForFinaliseError = requisition => null; // eslint-disable-line no-unused-vars

export class CustomerRequisitionPage extends React.Component {
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

  /**
   * Respond to the user editing the number in the required quantity column.
   *
   * @param   {string}  key              Should always be 'requiredQuantity'
   * @param   {object}  requisitionItem  The requisition item from the row being edited
   * @param   {string}  newValue         The value the user entered in the cell
   * @return  {none}
   */
  onEndEditing = (key, requisitionItem, newValue) => {
    // This will update associated CustomerInvoice if one exists or if linked
    // CustomerInvoice does not exist, suppliedQuantity will not be updated
    if (key !== 'suppliedQuantity') return;
    const { database } = this.props;
    database.write(() => requisitionItem.setSuppliedQuantity(database, newValue));
  };

  onUseRequestedQuantities = () => {
    const { database, requisition } = this.props;
    database.write(() => {
      requisition.items.forEach(requisitionItem =>
        requisitionItem.setSuppliedQuantity(database, requisitionItem.requiredQuantity)
      );
    });

    this.refreshData();
  };

  onUseSuggestedQuantities = () => {
    const { database, requisition } = this.props;
    database.write(() => {
      requisition.items.forEach(requisitionItem =>
        requisitionItem.setSuppliedQuantity(database, requisitionItem.suggestedQuantity)
      );
    });

    this.refreshData();
  };

  onSelectionChange = newSelection => this.setState({ selection: newSelection });

  getModalTitle = () => {
    const { modalKey } = this.state;
    const { ITEM_SELECT, COMMENT_EDIT } = MODAL_KEYS;

    switch (modalKey) {
      default:
      case ITEM_SELECT:
        return modalStrings.search_for_an_item_to_add;
      case COMMENT_EDIT:
        return modalStrings.edit_the_requisition_comment;
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

  openCommentEditor = () => this.openModal(MODAL_KEYS.COMMENT_EDIT);

  renderPageInfo = () => {
    const { requisition } = this.props;
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.months_stock_required}:`,
          info: requisition.monthsToSupply,
        },
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(requisition.entryDate),
        },
      ],
      [
        {
          title: `${pageInfoStrings.customer}:`,
          info: requisition.otherStoreName ? requisition.otherStoreName.name : '',
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
      case 'monthlyUsage':
      case 'suggestedQuantity':
      case 'requiredQuantity':
      case 'ourStockOnHand':
        return Math.round(requisitionItem[key]);
      case 'suppliedQuantity':
        return {
          type: requisition.isFinalised ? 'text' : 'editable',
          cellContents: requisitionItem.suppliedQuantity || 0,
        };
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: requisition.isFinalised,
        };
      default:
        return requisitionItem[key];
    }
  };

  renderModalContent = () => {
    const { database, requisition } = this.props;
    const { modalKey } = this.state;

    const { COMMENT_EDIT } = MODAL_KEYS;
    switch (modalKey) {
      default:
      case COMMENT_EDIT:
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
  };

  renderButtons = () => {
    const { requisition } = this.props;

    return (
      <View style={globalStyles.pageTopRightSectionContainer}>
        <View style={globalStyles.verticalContainer}>
          <PageButton
            style={globalStyles.topButton}
            text={buttonStrings.use_requested_quantities}
            onPress={this.onUseRequestedQuantities}
            isDisabled={requisition.isFinalised}
          />
          <PageButton
            style={globalStyles.topButton}
            text={buttonStrings.use_suggested_quantities}
            onPress={this.onUseSuggestedQuantities}
            isDisabled={requisition.isFinalised}
          />
        </View>
      </View>
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
            key: 'ourStockOnHand',
            width: 1.5,
            title: tableStrings.our_stock,
            alignText: 'center',
          },
          {
            key: 'stockOnHand',
            width: 1.5,
            title: tableStrings.their_stock,
            alignText: 'center',
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
            key: 'suppliedQuantity',
            width: 2,
            title: tableStrings.supply_quantity,
            sortable: true,
            alignText: 'right',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        finalisableDataType="Requisition"
        database={database}
        selection={selection}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        <PageContentModal
          isOpen={modalIsOpen && !requisition.isFinalised}
          onClose={this.closeModal}
          title={this.getModalTitle()}
        >
          {this.renderModalContent()}
        </PageContentModal>
      </GenericPage>
    );
  }
}

export default CustomerRequisitionPage;

/* eslint-disable react/require-default-props, react/forbid-prop-types */
CustomerRequisitionPage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  requisition: PropTypes.object.isRequired,
};
