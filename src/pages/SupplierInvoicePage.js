/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import {
  formatDate,
  parsePositiveInteger,
  sortDataBy,
} from '../utilities';
import { createRecord } from '../database';
import { GenericPage } from './GenericPage';
import globalStyles, { dataTableStyles } from '../globalStyles';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageContentModal,
  PageInfo,
  TextEditor,
  ExpiryTextInput,
  ToggleBar,
  VVNToggle,
} from '../widgets';
import { ItemBatch } from '../database/DataTypes/index';

const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];

const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
};

const SORT_DATA_TYPES = {
  itemName: 'string',
  itemCode: 'string',
  batch: 'string',
  totalQuantity: 'number',
  packSize: 'number',
};

export class SupplierInvoicePage extends React.Component {
  constructor(props) {
    super(props);
    this.dataFilters = {
      searchKey: '',
      sortBy: 'itemName',
      isAscending: true,
    };
    this.state = {
      showOtherItems: true,
      modalKey: null,
      modalIsOpen: false,
      selection: [],
      vaccineQuantity: 0,
      otherItemQuantity: 0,
    };
  }
  onToggleStatusFilter = showOtherItems => this.setState({ showOtherItems: showOtherItems }, this.refreshData);

  // Delete transaction batch then delete transactionItem if no more
  // transaction batches
  onDeleteConfirm = () => {
    const { selection } = this.state;
    const { transaction, database } = this.props;
    database.write(() => {
      transaction.removeTransactionBatchesById(database, selection);
    });
    this.setState({ selection: [] }, this.refreshData);
  }

  onDeleteCancel = () => this.setState({ selection: [] }, this.refreshData);

  onSelectionChange = (newSelection) => this.setState({ selection: newSelection });

  /**
   * Respond to the user editing fields
   * @param  {string} key             key of edited field
   * @param  {object} transactionBatch The transaction batch from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing = (key, transactionBatch, newValue) => {
    const { database } = this.props;
    database.write(() => {
      switch (key) {
        case 'totalQuantity':
          // Should edit the numberOfPacks directly if packSize becomes an editable column
          // that represents the number of packs counted
          transactionBatch.setTotalQuantity(database, parsePositiveInteger(newValue));
          break;
        case 'expiryDate':
          transactionBatch.expiryDate = newValue;
          break;
        default:
        case 'vvnStatus':
          transactionBatch.vvnStatus = newValue;
          break;
        case 'fridge':
          transactionBatch.location = newValue;
          transactionBatch.itemBatch.location = newValue;
          this.closeModal(this.refreshData);
          break;
      }
      database.save('TransactionBatch', transactionBatch);
    });
  }

  getModalTitle = () => {
    const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return modalStrings.search_for_an_item_to_add;
      case COMMENT_EDIT:
        return modalStrings.edit_the_invoice_comment;
      case THEIR_REF_EDIT:
        return modalStrings.edit_their_reference;
    }
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
    const { database, transaction } = this.props;
    const allTransactionBatches = transaction.getTransactionBatches(database);

    const transactionBatches = allTransactionBatches
              .filtered('itemName BEGINSWITH[c] $0', searchTerm);

    const sortDataType = SORT_DATA_TYPES[sortBy] || 'realm';

    this.setState({
      data: sortDataBy(transactionBatches, sortBy, sortDataType, isAscending),
    });
  }


  addNewLine = (item) => {
    const { database, transaction } = this.props;
    database.write(() => {
      const transactionItem = createRecord(database, 'TransactionItem', transaction, item);
      createRecord(
        database,
        'TransactionBatch',
        transactionItem,
        createRecord(database, 'ItemBatch', item, '')
      );
    });
  }
  
  openModal = (key) => this.setState({ modalKey: key, modalIsOpen: true });

  closeModal = (method) => this.setState({ modalIsOpen: false }, () => method && method());

  openItemSelector = () => this.openModal(MODAL_KEYS.ITEM_SELECT);
  openFridgeSelection = () => this.openModal('fridgeSelector');

  openCommentEditor = () => this.openModal(MODAL_KEYS.COMMENT_EDIT);

  openTheirRefEditor = () => this.openModal(MODAL_KEYS.THEIR_REF_EDIT);

  renderPageInfo = () => {
    const { transaction } = this.props;
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(transaction.entryDate),
        },
        {
          title: `${pageInfoStrings.confirm_date}:`,
          info: formatDate(transaction.confirmDate),
        },
      ],
      [
        {
          title: `${pageInfoStrings.supplier}:`,
          info: this.props.transaction.otherParty && this.props.transaction.otherParty.name,
        },
        {
          title: `${pageInfoStrings.their_ref}:`,
          info: transaction.theirRef,
          onPress: this.openTheirRefEditor,
          editableType: 'text',
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: transaction.comment,
          onPress: this.openCommentEditor,
          editableType: 'text',
        },
      ],
    ];
    return (
      <PageInfo columns={infoColumns} isEditingDisabled={this.props.transaction.isFinalised} />
    );
  }

  renderCell = (key, transactionBatch) => {
    const isEditable = !this.props.transaction.isFinalised;
    const type = isEditable ? 'editable' : 'text';
    const editableCell = {
      type: type,
      cellContents: String(transactionBatch[key]),
    };
    switch (key) {
      default:
        return {
          cellContents: transactionBatch[key],
        };
      case 'totalQuantity':
        return editableCell;
      case 'expiryDate': {
        return (
          <ExpiryTextInput
            key={transactionBatch.id}
            isEditable={isEditable}
            onEndEditing={(newValue) => this.onEndEditing(key, transactionBatch, newValue)}
            text={transactionBatch[key]}
            style={dataTableStyles.text}
          />
        );
      }
      case 'fridge': {
        if(!transactionBatch.itemBatch.item.category || transactionBatch.itemBatch.item.category.name !== 'Vaccine') {
          return {cellContents: ''};
        }
        return (
          <PageButton
            key={transactionBatch.id}
            textStyle={{textDecorationLine: 'underline'}}
            style={{ margin: 3, padding: 6, width: 'auto', height: 'auto', borderWidth: 0}}
            text={`${transactionBatch.location ? transactionBatch.location.name : 'Select'}`}
            onPress={() => {
              this.selectedBatch = transactionBatch;
              this.openFridgeSelection();
            }}
            isDisabled={this.props.transaction.isFinalised}
          />
        );
      }
      case 'vvnStatus': {
        if(!transactionBatch.itemBatch.item.category || transactionBatch.itemBatch.item.category.name !== 'Vaccine') {
          return {cellContents: ''};
        }
        return (
          <VVNToggle
            key={transactionBatch.id}
            onEndEditing={(newValue) => this.onEndEditing(key, transactionBatch, newValue)}
            status={transactionBatch[key]}
            isDisabled={this.props.transaction.isFinalised}
          />
        );
      }
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: this.props.transaction.isFinalised,
        };
    }
  }

  renderModalContent = () => {
    const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
    const { database, transaction } = this.props;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={database.objects('Item')}
            queryString={'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'}
            queryStringSecondary={'name CONTAINS[c] $0'}
            sortByString={'name'}
            onSelect={item => {
              this.addNewLine(item);
              this.refreshData();
              this.closeModal();
            }}
            renderLeftText={item => `${item.name}`}
            renderRightText={item => `${item.totalQuantity}`}
          />
        );
      case 'fridgeSelector':
        return (
          <AutocompleteSelector
              options={database.objects('Location')}
              queryString={'name BEGINSWITH[c] $0'}
              queryStringSecondary={'name CONTAINS[c] $0'}
              sortByString={'name'}
              onSelect={(fridge) => this.onEndEditing('fridge', this.selectedBatch, fridge)}
              renderLeftText={fridge => `${fridge.name}`}
          />
          );
      case COMMENT_EDIT:
        return (
          <TextEditor
            text={transaction.comment}
            onEndEditing={newComment => {
              if (newComment !== transaction.comment) {
                database.write(() => {
                  transaction.comment = newComment;
                  database.save('Transaction', transaction);
                });
              }
              this.closeModal();
            }}
          />
        );
      case THEIR_REF_EDIT:
        return (
          <TextEditor
            text={transaction.theirRef}
            onEndEditing={newTheirRef => {
              if (newTheirRef !== transaction.theirRef) {
                database.write(() => {
                  transaction.theirRef = newTheirRef;
                  database.save('Transaction', transaction);
                });
              }
              this.closeModal();
            }}
          />
        );
    }
  }

  renderAddBatchButton = () => (

    <View style={globalStyles.verticalContainer}>
        <PageButton
          style={{ marginLeft: 5, marginTop: 10 }}
          text={buttonStrings.new_line}
          onPress={this.openItemSelector}
          isDisabled={this.props.transaction.isFinalised}
        />
    </View>

  );

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopLeftComponent={this.renderPageInfo}
        renderTopRightComponent={this.renderAddBatchButton}
        onEndEditing={this.onEndEditing}
        onSelectionChange={this.onSelectionChange}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'itemCode',
            width: 1,
            title: tableStrings.item_code,
            sortable: true,
          },
          {
            key: 'itemName',
            width: 3,
            title: tableStrings.item_name,
            sortable: true,
          },
          {
            key: 'totalQuantity',
            width: 1,
            title: tableStrings.quantity,
            alignText: 'right',
          },
          {
            key: 'expiryDate',
            width: 1,
            title: tableStrings.batch_expiry,
            alignText: 'center',
          },
            {
              key: 'vvnStatus',
              width: 1,
              title: 'VVM Status',
              alignText: 'center',
            },
            {
              key: 'fridge',
              width: 1,
              title: 'Fridge',
              alignText: 'center',
            },
          {
            key: 'remove',
            width: 1,
            title: tableStrings.remove,
            alignText: 'center',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        finalisableDataType={'Transaction'}
        database={this.props.database}
        selection={this.state.selection}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      >
        <BottomConfirmModal
          isOpen={this.state.selection.length > 0 && !this.props.transaction.isFinalised}
          questionText={modalStrings.remove_these_items}
          onCancel={() => this.onDeleteCancel()}
          onConfirm={() => this.onDeleteConfirm()}
          confirmText={modalStrings.remove}
        />
        <PageContentModal
          isOpen={this.state.modalIsOpen && !this.props.transaction.isFinalised}
          onClose={this.closeModal}
          title={this.getModalTitle()}
        >
          {this.renderModalContent()}
        </PageContentModal>
      </GenericPage>
    );
  }
}

export function checkForFinaliseError(transaction) {
  const allVaccineBatches = transaction.items.filtered('item.category.name == $0', 'Vaccine');

  const checkVVMOnBatches = (transactionBatches) =>
    transactionBatches.find(transactionBatch => transactionBatch.vvnStatus === null);

  const hasVVMStoConfirm = allVaccineBatches.find((transactionItem) => checkVVMOnBatches(transactionItem.batches));
  if (hasVVMStoConfirm) return 'Please confirm VVMs on all vaccines before finalising';

  const checkLocationOnBatches = (transactionBatches) =>
    transactionBatches.find(transactionBatch => transactionBatch.location === null && transactionBatch.vvnStatus);
  const hasUnallocatedBatches = allVaccineBatches.find((transactionItem) => checkLocationOnBatches(transactionItem.batches));
  if (hasUnallocatedBatches) return 'Please assign fridge to all vaccines';

  if (!transaction.isExternalSupplierInvoice) return null;
  if (transaction.items.length === 0) return modalStrings.add_at_least_one_item_before_finalising;
  if (transaction.totalQuantity === 0) return modalStrings.stock_quantity_greater_then_zero;
  return null;
}

SupplierInvoicePage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  transaction: PropTypes.object,
};



/// WITH VACCINE TOGGLE

// /**
//  * mSupply Mobile
//  * Sustainable Solutions (NZ) Ltd. 2016
//  */

// import React from 'react';
// import PropTypes from 'prop-types';
// import { View } from 'react-native';
// import {
//   formatDate,
//   parsePositiveInteger,
//   sortDataBy,
// } from '../utilities';
// import { createRecord } from '../database';
// import { GenericPage } from './GenericPage';
// import globalStyles, { dataTableStyles } from '../globalStyles';
// import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
// import {
//   AutocompleteSelector,
//   BottomConfirmModal,
//   PageButton,
//   PageContentModal,
//   PageInfo,
//   TextEditor,
//   ExpiryTextInput,
//   ToggleBar,
//   VVNToggle,
// } from '../widgets';
// import { ItemBatch } from '../database/DataTypes/index';

// const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];

// const MODAL_KEYS = {
//   COMMENT_EDIT: 'commentEdit',
//   THEIR_REF_EDIT: 'theirRefEdit',
//   ITEM_SELECT: 'itemSelect',
// };

// const SORT_DATA_TYPES = {
//   itemName: 'string',
//   itemCode: 'string',
//   batch: 'string',
//   totalQuantity: 'number',
//   packSize: 'number',
// };

// export class SupplierInvoicePage extends React.Component {
//   constructor(props) {
//     super(props);
//     this.dataFilters = {
//       searchKey: '',
//       sortBy: 'itemName',
//       isAscending: true,
//     };
//     this.state = {
//       showOtherItems: true,
//       modalKey: null,
//       modalIsOpen: false,
//       selection: [],
//       vaccineQuantity: 0,
//       otherItemQuantity: 0,
//     };
//   }
//   onToggleStatusFilter = showOtherItems => this.setState({ showOtherItems: showOtherItems }, this.refreshData);

//   // Delete transaction batch then delete transactionItem if no more
//   // transaction batches
//   onDeleteConfirm = () => {
//     const { selection } = this.state;
//     const { transaction, database } = this.props;
//     database.write(() => {
//       transaction.removeTransactionBatchesById(database, selection);
//     });
//     this.setState({ selection: [] }, this.refreshData);
//   }

//   onDeleteCancel = () => this.setState({ selection: [] }, this.refreshData);

//   onSelectionChange = (newSelection) => this.setState({ selection: newSelection });

//   /**
//    * Respond to the user editing fields
//    * @param  {string} key             key of edited field
//    * @param  {object} transactionBatch The transaction batch from the row being edited
//    * @param  {string} newValue        The value the user entered in the cell
//    * @return {none}
//    */
//   onEndEditing = (key, transactionBatch, newValue) => {
//     const { database } = this.props;
//     database.write(() => {
//       switch (key) {
//         case 'totalQuantity':
//           // Should edit the numberOfPacks directly if packSize becomes an editable column
//           // that represents the number of packs counted
//           transactionBatch.setTotalQuantity(database, parsePositiveInteger(newValue));
//           break;
//         case 'expiryDate':
//           transactionBatch.expiryDate = newValue;
//           break;
//         default:
//         case 'vvnStatus':
//           transactionBatch.vvnStatus = newValue;
//           break;
//         case 'fridge':
//           transactionBatch.location = newValue;
//           transactionBatch.itemBatch.location = newValue;
//           this.closeModal(this.refreshData);
//           break;
//       }
//       database.save('TransactionBatch', transactionBatch);
//     });
//   }

//   getModalTitle = () => {
//     const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
//     switch (this.state.modalKey) {
//       default:
//       case ITEM_SELECT:
//         return modalStrings.search_for_an_item_to_add;
//       case COMMENT_EDIT:
//         return modalStrings.edit_the_invoice_comment;
//       case THEIR_REF_EDIT:
//         return modalStrings.edit_their_reference;
//     }
//   }

//   updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
//     // We use != null, which checks for both null or undefined (undefined coerces to null)
//     if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
//     if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
//     if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
//   }

//   /**
//    * Returns updated data according to searchTerm, sortBy and isAscending.
//    */
//   refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
//     this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
//     const { searchTerm, sortBy, isAscending } = this.dataFilters;
//     const { database, transaction } = this.props;
//     const allTransactionBatches = transaction.getTransactionBatches(database);

//     const transactionBatches = allTransactionBatches
//               .filtered(`itemBatch.item.category.name ${this.state.showOtherItems ? '!=' : '='} $0`, 'Vaccine')
//               .filtered('itemName BEGINSWITH[c] $0', searchTerm);

//     const sortDataType = SORT_DATA_TYPES[sortBy] || 'realm';
//     const vaccineQuantity = allTransactionBatches.filtered('itemBatch.item.category.name = $0', 'Vaccine').length;
//     const otherItemQuantity = allTransactionBatches.length - vaccineQuantity;

//     this.setState({
//       data: sortDataBy(transactionBatches, sortBy, sortDataType, isAscending),
//       otherItemQuantity,
//       vaccineQuantity,
//     });
//   }


//   addNewLine = (item) => {
//     const { database, transaction } = this.props;
//     database.write(() => {
//       const transactionItem = createRecord(database, 'TransactionItem', transaction, item);
//       createRecord(
//         database,
//         'TransactionBatch',
//         transactionItem,
//         createRecord(database, 'ItemBatch', item, '')
//       );
//     });
//   }
  
//   openModal = (key) => this.setState({ modalKey: key, modalIsOpen: true });

//   closeModal = (method) => this.setState({ modalIsOpen: false }, () => method && method());

//   openItemSelector = () => this.openModal(MODAL_KEYS.ITEM_SELECT);
//   openFridgeSelection = () => this.openModal('fridgeSelector');

//   openCommentEditor = () => this.openModal(MODAL_KEYS.COMMENT_EDIT);

//   openTheirRefEditor = () => this.openModal(MODAL_KEYS.THEIR_REF_EDIT);

//   renderPageInfo = () => {
//     const { transaction } = this.props;
//     const infoColumns = [
//       [
//         {
//           title: `${pageInfoStrings.entry_date}:`,
//           info: formatDate(transaction.entryDate),
//         },
//         {
//           title: `${pageInfoStrings.confirm_date}:`,
//           info: formatDate(transaction.confirmDate),
//         },
//       ],
//       [
//         {
//           title: `${pageInfoStrings.supplier}:`,
//           info: this.props.transaction.otherParty && this.props.transaction.otherParty.name,
//         },
//         {
//           title: `${pageInfoStrings.their_ref}:`,
//           info: transaction.theirRef,
//           onPress: this.openTheirRefEditor,
//           editableType: 'text',
//         },
//         {
//           title: `${pageInfoStrings.comment}:`,
//           info: transaction.comment,
//           onPress: this.openCommentEditor,
//           editableType: 'text',
//         },
//       ],
//     ];
//     return (
//       <PageInfo columns={infoColumns} isEditingDisabled={this.props.transaction.isFinalised} />
//     );
//   }

//   renderCell = (key, transactionBatch) => {
//     const isEditable = !this.props.transaction.isFinalised;
//     const type = isEditable ? 'editable' : 'text';
//     const editableCell = {
//       type: type,
//       cellContents: String(transactionBatch[key]),
//     };
//     switch (key) {
//       default:
//         return {
//           cellContents: transactionBatch[key],
//         };
//       case 'totalQuantity':
//         return editableCell;
//       case 'expiryDate': {
//         return (
//           <ExpiryTextInput
//             key={transactionBatch.id}
//             isEditable={isEditable}
//             onEndEditing={(newValue) => this.onEndEditing(key, transactionBatch, newValue)}
//             text={transactionBatch[key]}
//             style={dataTableStyles.text}
//           />
//         );
//       }
//       case 'fridge': {
//         return {
//           cellContents: transactionBatch.location.name,
//         };
//         // return (
//         //   <PageButton
//         //     key={transactionBatch.id}
//         //     style={{ margin: 3, padding: 6, width: 'auto', height: 'auto' }}
//         //     text={`» ${transactionBatch.location ? transactionBatch.location.name : 'Select'}`}
//         //     onPress={() => {
//         //       this.selectedBatch = transactionBatch;
//         //       this.openFridgeSelection();
//         //     }}
//         //     isDisabled={this.props.transaction.isFinalised}
//         //   />
//         // );
//       }
//       case 'vvnStatus': {
//         return (
//           <VVNToggle
//             key={transactionBatch.id}
//             onEndEditing={(newValue) => this.onEndEditing(key, transactionBatch, newValue)}
//             status={transactionBatch[key]}
//             isDisabled={this.props.transaction.isFinalised}
//           />
//         );
//       }
//       case 'remove':
//         return {
//           type: 'checkable',
//           icon: 'md-remove-circle',
//           isDisabled: this.props.transaction.isFinalised,
//         };
//     }
//   }

//   renderModalContent = () => {
//     const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
//     const { database, transaction } = this.props;
//     switch (this.state.modalKey) {
//       default:
//       case ITEM_SELECT:
//         return (
//           <AutocompleteSelector
//             options={database.objects('Item').filtered(`category.name ${this.state.showOtherItems ? '!=' : '='} $0`, 'Vaccine')}
//             queryString={'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'}
//             queryStringSecondary={'name CONTAINS[c] $0'}
//             sortByString={'name'}
//             onSelect={item => {
//               this.addNewLine(item);
//               this.refreshData();
//               this.closeModal();
//             }}
//             renderLeftText={item => `${item.name}`}
//             renderRightText={item => `${item.totalQuantity}`}
//           />
//         );
//       case 'fridgeSelector':
//         return (
//           <AutocompleteSelector
//               options={database.objects('Location')}
//               queryString={'name BEGINSWITH[c] $0'}
//               queryStringSecondary={'name CONTAINS[c] $0'}
//               sortByString={'name'}
//               onSelect={(fridge) => this.onEndEditing('fridge', this.selectedBatch, fridge)}
//               renderLeftText={fridge => `${fridge.name}`}
//           />
//           );
//       case COMMENT_EDIT:
//         return (
//           <TextEditor
//             text={transaction.comment}
//             onEndEditing={newComment => {
//               if (newComment !== transaction.comment) {
//                 database.write(() => {
//                   transaction.comment = newComment;
//                   database.save('Transaction', transaction);
//                 });
//               }
//               this.closeModal();
//             }}
//           />
//         );
//       case THEIR_REF_EDIT:
//         return (
//           <TextEditor
//             text={transaction.theirRef}
//             onEndEditing={newTheirRef => {
//               if (newTheirRef !== transaction.theirRef) {
//                 database.write(() => {
//                   transaction.theirRef = newTheirRef;
//                   database.save('Transaction', transaction);
//                 });
//               }
//               this.closeModal();
//             }}
//           />
//         );
//     }
//   }

//   renderAddBatchButton = () => (

//     <View style={globalStyles.verticalContainer}>
//       <ToggleBar
//         style={globalStyles.toggleBar}
//         textOffStyle={globalStyles.toggleText}
//         textOnStyle={globalStyles.toggleTextSelected}
//         toggleOffStyle={globalStyles.toggleOption}
//         toggleOnStyle={globalStyles.toggleOptionSelected}
//         toggles={[
//           {
//             text: `Non Cold Chain ${this.state.otherItemQuantity === 0 ? '' : '(' + this.state.otherItemQuantity + ')'}`,
//             onPress: () => this.onToggleStatusFilter(true),
//             isOn: this.state.showOtherItems,
//           },
//           {
//             text: `Cold Chain ${this.state.vaccineQuantity === 0 ? '' : '(' + this.state.vaccineQuantity + ')'}`,
//             onPress: () => this.onToggleStatusFilter(false),
//             isOn: !this.state.showOtherItems,
//             badgeValue: 1,
//           },
//         ]}
//       />
//         <PageButton
//           style={{ marginLeft: 5, marginTop: 10 }}
//           text={buttonStrings.new_line}
//           onPress={this.openItemSelector}
//           isDisabled={this.props.transaction.isFinalised}
//         />

//     </View>

//   );

//   render() {
//     return (
//       <GenericPage
//         data={this.state.data}
//         refreshData={this.refreshData}
//         renderCell={this.renderCell}
//         renderTopLeftComponent={this.renderPageInfo}
//         renderTopRightComponent={this.renderAddBatchButton}
//         onEndEditing={this.onEndEditing}
//         onSelectionChange={this.onSelectionChange}
//         defaultSortKey={this.dataFilters.sortBy}
//         defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
//         columns={[
//           {
//             key: 'itemCode',
//             width: 1,
//             title: tableStrings.item_code,
//             sortable: true,
//           },
//           {
//             key: 'itemName',
//             width: 3,
//             title: tableStrings.item_name,
//             sortable: true,
//           },
//           {
//             key: 'totalQuantity',
//             width: 1,
//             title: tableStrings.quantity,
//             alignText: 'right',
//           },
//           {
//             key: 'expiryDate',
//             width: 1,
//             title: tableStrings.batch_expiry,
//             alignText: 'center',
//           },
//           ...(this.state.showOtherItems ? [] : [
//             {
//               key: 'vvnStatus',
//               width: 1,
//               title: 'VVM Status',
//               alignText: 'center',
//             },
//             {
//               key: 'fridge',
//               width: 1,
//               title: 'Fridge',
//               alignText: 'center',
//             },
//           ]),
//           {
//             key: 'remove',
//             width: 1,
//             title: tableStrings.remove,
//             alignText: 'center',
//           },
//         ]}
//         dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
//         finalisableDataType={'Transaction'}
//         database={this.props.database}
//         selection={this.state.selection}
//         {...this.props.genericTablePageStyles}
//         topRoute={this.props.topRoute}
//       >
//         <BottomConfirmModal
//           isOpen={this.state.selection.length > 0 && !this.props.transaction.isFinalised}
//           questionText={modalStrings.remove_these_items}
//           onCancel={() => this.onDeleteCancel()}
//           onConfirm={() => this.onDeleteConfirm()}
//           confirmText={modalStrings.remove}
//         />
//         <PageContentModal
//           isOpen={this.state.modalIsOpen && !this.props.transaction.isFinalised}
//           onClose={this.closeModal}
//           title={this.getModalTitle()}
//         >
//           {this.renderModalContent()}
//         </PageContentModal>
//       </GenericPage>
//     );
//   }
// }

// export function checkForFinaliseError(transaction) {
//   const allVaccineBatches = transaction.items.filtered('item.category.name == $0', 'Vaccine');

//   const checkVVMOnBatches = (transactionBatches) =>
//     transactionBatches.find(transactionBatch => transactionBatch.vvnStatus === null);

//   const hasVVMStoConfirm = allVaccineBatches.find((transactionItem) => checkVVMOnBatches(transactionItem.batches));
//   if (hasVVMStoConfirm) return 'Please confirm VVMs on all vaccines before finalising';

//   const checkLocationOnBatches = (transactionBatches) =>
//     transactionBatches.find(transactionBatch => transactionBatch.location === null && transactionBatch.vvnStatus);
//   const hasUnallocatedBatches = allVaccineBatches.find((transactionItem) => checkLocationOnBatches(transactionItem.batches));
//   if (hasUnallocatedBatches) return 'Please assign fridge to all vaccines';

//   if (!transaction.isExternalSupplierInvoice) return null;
//   if (transaction.items.length === 0) return modalStrings.add_at_least_one_item_before_finalising;
//   if (transaction.totalQuantity === 0) return modalStrings.stock_quantity_greater_then_zero;
//   return null;
// }

// SupplierInvoicePage.propTypes = {
//   database: PropTypes.object,
//   genericTablePageStyles: PropTypes.object,
//   topRoute: PropTypes.bool,
//   transaction: PropTypes.object,
// };
