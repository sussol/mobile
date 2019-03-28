/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';

import { GenericPage } from './GenericPage';

import { createRecord } from '../database';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import { SETTINGS_KEYS } from '../settings';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';
import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageInfo,
  PageContentModal,
  TextEditor,
  ToggleSelector,
  ToggleBar,
} from '../widgets';

import globalStyles from '../globalStyles';

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
      isProgramOrder: false,
      orderType: null,
      useThresholdMOS: false,
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'itemName',
      isAscending: true,
    };
  }

  componentDidMount = () => {
    const { requisition, settings } = this.props;
    if (requisition.program) {
      const tags = settings.get(SETTINGS_KEYS.THIS_STORE_TAGS);
      const orderType = requisition.program.getOrderType(tags, requisition.orderType);
      this.setState({ isProgramOrder: !!requisition.program, orderType });
    }
  };

  onAddMasterItems = () => {
    const { database, requisition, runWithLoadingIndicator } = this.props;
    runWithLoadingIndicator(() => {
      database.write(() => {
        requisition.addItemsFromMasterList(database, this.getThisStore());
        database.save('Requisition', requisition);
      });
      this.refreshData();
    });
  };

  onCreateAutomaticOrder = () => {
    const { database, requisition, runWithLoadingIndicator, settings } = this.props;
    const { isProgramOrder } = this.state;
    runWithLoadingIndicator(() => {
      database.write(() => {
        if (isProgramOrder) {
          requisition.createAutomaticProgramOrder(database, settings.get('ThisStoreTags'));
        } else {
          requisition.createAutomaticOrder(database, this.getThisStore());
        }
        database.save('Requisition', requisition);
      });
      this.refreshData();
    });
  };

  /**
   * Respond to the user editing the number in the required quantity column.
   *
   * @param   {string}  key              Should always be |requiredQuantity|.
   * @param   {object}  requisitionItem  The requisition item from the row being edited.
   * @param   {string}  newValue         The value the user entered in the cell.
   * @return  {none}
   */
  onEndEditing = (key, requisitionItem, newValue) => {
    const { database } = this.props;

    if (key !== 'requiredQuantity') return;

    database.write(() => {
      requisitionItem.requiredQuantity = parsePositiveInteger(newValue);
      database.save('RequisitionItem', requisitionItem);
    });
  };

  onDeleteConfirm = () => {
    const { requisition, database } = this.props;
    const { selection } = this.state;

    database.write(() => {
      requisition.removeItemsById(database, selection);
      database.save('Requisition', requisition);
    });
    this.setState({ selection: [] });
    this.refreshData();
  };

  onDeleteCancel = () => {
    this.setState({ selection: [] });
    this.refreshData();
  };

  onUseSuggestedQuantities = () => {
    const { runWithLoadingIndicator } = this.props;

    runWithLoadingIndicator(() => {
      const { database, requisition } = this.props;
      database.write(() => {
        requisition.setRequestedToSuggested(database);
        database.save('Requisition', requisition);
      });
      this.refreshData();
    });
  };

  onSelectionChange = newSelection => this.setState({ selection: newSelection });

  getThisStore = () => {
    const { database, settings } = this.props;

    const thisStoreNameId = settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID);
    const nameResults = database.objects('Name').filtered('id == $0', thisStoreNameId);

    if (!nameResults || nameResults.length <= 0) return null;

    return nameResults[0];
  };

  getModalTitle = () => {
    const { modalKey } = this.state;

    const { ITEM_SELECT, COMMENT_EDIT, MONTHS_SELECT } = MODAL_KEYS;

    switch (modalKey) {
      default:
      case ITEM_SELECT:
        return modalStrings.search_for_an_item_to_add;
      case COMMENT_EDIT:
        return modalStrings.edit_the_requisition_comment;
      case MONTHS_SELECT:
        return modalStrings.select_the_number_of_months_stock_required;
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
    const { useThresholdMOS, orderType } = this.state;

    if (newSearchTerm && newSortBy && newIsAscending) {
      this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    }

    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    let data = requisition.items.filtered(
      'item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0',
      searchTerm
    );
    if (useThresholdMOS) {
      data = data.filter(requisitionItem =>
        requisitionItem.item.isLessThanThresholdMOS(orderType.thresholdMOS)
      );
    }

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

  openItemSelector = () => this.openModal(MODAL_KEYS.ITEM_SELECT);

  openMonthsSelector = () => this.openModal(MODAL_KEYS.MONTHS_SELECT);

  openCommentEditor = () => this.openModal(MODAL_KEYS.COMMENT_EDIT);

  renderPageInfo = () => {
    const { requisition } = this.props;
    const { isProgramOrder, orderType } = this.state;
    const { period, program } = requisition;
    const infoColumns = [
      [
        {
          title: 'Program:',
          info: program && program.name,
          shouldShow: isProgramOrder,
        },
        {
          title: 'Order Type:',
          info: orderType && orderType.name,
          shouldShow: isProgramOrder,
        },
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
          title: 'Period:',
          info: period && `${period.name} -- ${period.toString()}`,
          shouldShow: isProgramOrder,
        },
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
          canEdit: true,
        },
      ],
    ];

    return (
      <PageInfo
        columns={infoColumns}
        isEditingDisabled={requisition.isFinalised || isProgramOrder}
      />
    );
  };

  renderCell = (key, requisitionItem) => {
    const { requisition } = this.props;

    switch (key) {
      default:
        return requisitionItem[key];
      case 'monthlyUsage':
      case 'suggestedQuantity':
        return Math.round(requisitionItem[key]);
      case 'requiredQuantity':
        return {
          type: requisition.isFinalised ? 'text' : 'editable',
          cellContents: Math.round(requisitionItem.requiredQuantity),
        };
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: requisition.isFinalised,
        };
    }
  };

  renderModalContent = () => {
    const { modalKey } = this.state;
    const { database, requisition } = this.props;

    const { COMMENT_EDIT, ITEM_SELECT, MONTHS_SELECT } = MODAL_KEYS;

    switch (modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={database.objects('Item')}
            queryString="name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0"
            queryStringSecondary="name CONTAINS[c] $0"
            sortByString="name"
            onSelect={item => {
              database.write(() => {
                if (!requisition.hasItem(item)) {
                  createRecord(database, 'RequisitionItem', requisition, item);
                }
              });
              this.refreshData();
              this.closeModal();
            }}
            renderLeftText={item => `${item.name}`}
            renderRightText={item => `${item.totalQuantity}`}
          />
        );
      case MONTHS_SELECT:
        return (
          <ToggleSelector
            options={[1, 2, 3, 4, 5, 6]}
            onSelect={number => {
              database.write(() => {
                requisition.monthsToSupply = number;
                database.save('Requisition', requisition);
              });
              this.refreshData();
              this.closeModal();
            }}
            selected={requisition.monthsToSupply}
          />
        );
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

  getToggleBarProps = () => {
    const { useThresholdMOS } = this.state;
    return [
      {
        text: 'Hide over stocked',
        onPress: () => this.setState({ useThresholdMOS: true }, this.refreshData),
        isOn: useThresholdMOS,
      },
      {
        text: 'Show over stocked',
        onPress: () => this.setState({ useThresholdMOS: false }, this.refreshData),
        isOn: !useThresholdMOS,
      },
    ];
  };

  renderButtons = () => {
    const { requisition } = this.props;
    const { isProgramOrder } = this.state;
    return (
      <View style={globalStyles.pageTopRightSectionContainer}>
        <View style={globalStyles.verticalContainer}>
          <PageButton
            style={{ ...globalStyles.topButton, marginLeft: isProgramOrder ? 5 : 0 }}
            text={buttonStrings.create_automatic_order}
            onPress={this.onCreateAutomaticOrder}
            isDisabled={requisition.isFinalised}
          />
          {isProgramOrder && (
            <ToggleBar style={globalStyles.toggleBar} toggles={this.getToggleBarProps()} />
          )}

          {!isProgramOrder && (
            <PageButton
              style={globalStyles.leftButton}
              text={buttonStrings.use_suggested_quantities}
              onPress={this.onUseSuggestedQuantities}
              isDisabled={requisition.isFinalised}
            />
          )}
        </View>

        {!isProgramOrder && (
          <View style={globalStyles.verticalContainer}>
            <PageButton
              style={globalStyles.topButton}
              text={buttonStrings.new_item}
              onPress={() => this.openModal(MODAL_KEYS.ITEM_SELECT)}
              isDisabled={requisition.isFinalised}
            />
            <PageButton
              text={buttonStrings.add_master_list_items}
              onPress={this.onAddMasterItems}
              isDisabled={requisition.isFinalised}
            />
          </View>
        )}
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
        finalisableDataType="Requisition"
        database={database}
        selection={selection}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        <BottomConfirmModal
          isOpen={selection.length > 0 && !requisition.isFinalised}
          questionText={modalStrings.remove_these_items}
          onCancel={this.onDeleteCancel}
          onConfirm={this.onDeleteConfirm}
          confirmText={modalStrings.remove}
        />
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

/**
 * Check whether a given requisition is safe to be finalised. Return null if safe,
 * else return an appropriate error message.
 *
 * @param   {object}  requisition  The requisition to check.
 * @return  {string}               Null if safe to finalise, else an error message.
 */
export function checkForFinaliseError(requisition) {
  if (requisition.items.length === 0) {
    return modalStrings.add_at_least_one_item_before_finalising;
  }

  if (requisition.totalRequiredQuantity === 0) {
    return modalStrings.record_stock_required_before_finalising;
  }

  return null;
}

/* eslint-disable react/forbid-prop-types, react/require-default-props */
SupplierRequisitionPage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  requisition: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
};
