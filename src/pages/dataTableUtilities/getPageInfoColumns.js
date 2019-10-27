/* eslint-disable dot-notation */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */
import { pageInfoStrings, programStrings, tableStrings } from '../../localization';
import { MODAL_KEYS, formatDate } from '../../utilities';
import { ROUTES } from '../../navigation/constants';
/**
 * PageInfo rows/columns for use with the PageInfo component.
 *
 *
 * To add a page, add the pages routeName (see: pages/index.js)
 * and a 2d array of page info rows to PER_PAGE_INFO_COLUMNS,
 * of the desired pageinfo rows needed on the page.
 *
 * To use in the new page: use the usePageReducer hook.
 * usePageReducer will inject a your pages reducer with a field
 * pageInfo - a function returned by getPageInfo. Passing
 * this function the particular pages base object - i.e,
 * transaction, requisition or stock and it's dispatch will return the
 * required pageInfo columns for the page.
 */

const PER_PAGE_INFO_COLUMNS = {
  [ROUTES.CUSTOMER_INVOICE]: [
    ['entryDate', 'confirmDate', 'enteredBy'],
    ['customer', 'theirRef', 'transactionComment'],
  ],
  [ROUTES.SUPPLIER_INVOICE]: [
    ['entryDate', 'confirmDate'],
    ['otherParty', 'theirRef', 'transactionComment'],
  ],
  [ROUTES.SUPPLIER_REQUISITION]: [
    ['entryDate', 'enteredBy'],
    ['otherParty', 'editableMonthsToSupply', 'requisitionComment'],
  ],
  [ROUTES.SUPPLIER_REQUISITION_WITH_PROGRAM]: [
    ['program', 'orderType', 'entryDate', 'enteredBy'],
    ['period', 'otherParty', 'monthsToSupply', 'requisitionComment'],
  ],
  [ROUTES.STOCKTAKE_EDITOR]: [['stocktakeName', 'stocktakeComment']],
  [ROUTES.STOCKTAKE_EDITOR_WITH_REASONS]: [['stocktakeName', 'stocktakeComment']],
  [ROUTES.CUSTOMER_REQUISITION]: [
    ['monthsToSupply', 'entryDate'],
    ['customer', 'requisitionComment'],
  ],
  stocktakeBatchEditModal: [['itemName']],
  stocktakeBatchEditModalWithReasons: [['itemName']],
};

const PAGE_INFO_ROWS = (pageObject, dispatch, PageActions) => ({
  entryDate: {
    title: `${pageInfoStrings.entry_date}:`,
    info: formatDate(pageObject.entryDate) || 'N/A',
  },
  confirmDate: {
    title: `${pageInfoStrings.confirm_date}:`,
    info: formatDate(pageObject.confirmDate),
  },
  enteredBy: {
    title: `${pageInfoStrings.entered_by}:`,
    info: pageObject.enteredBy && pageObject.enteredBy.username,
  },
  customer: {
    title: `${pageInfoStrings.customer}:`,
    info: pageObject.otherPartyName,
  },
  theirRef: {
    title: `${pageInfoStrings.their_ref}:`,
    info: pageObject.theirRef,
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.THEIR_REF_EDIT)),
    editableType: 'text',
  },
  transactionComment: {
    title: `${pageInfoStrings.comment}:`,
    info: pageObject.comment,
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.TRANSACTION_COMMENT_EDIT)),
    editableType: 'text',
  },
  stocktakeComment: {
    title: `${pageInfoStrings.comment}:`,
    info: pageObject.comment,
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.STOCKTAKE_COMMENT_EDIT)),
    editableType: 'text',
  },
  requisitionComment: {
    title: `${pageInfoStrings.comment}:`,
    info: pageObject.comment,
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.REQUISITION_COMMENT_EDIT)),
    editableType: 'text',
  },
  otherParty: {
    title: `${pageInfoStrings.supplier}:`,
    info: pageObject.otherPartyName,
  },
  program: {
    title: `${programStrings.program}:`,
    info: pageObject.program && pageObject.program.name,
  },
  orderType: {
    title: `${programStrings.order_type}:`,
    info: pageObject.orderType,
  },
  editableMonthsToSupply: {
    title: `${pageInfoStrings.months_stock_required}:`,
    info: pageObject.monthsToSupply,
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_MONTH)),
    editableType: 'selectable',
  },
  period: {
    title: `${programStrings.period}:`,
    info: pageObject.period && pageObject.period.toInfoString(),
  },
  monthsToSupply: {
    title: `${pageInfoStrings.months_stock_required}:`,
    info: pageObject.monthsToSupply,
  },
  stocktakeName: {
    title: `${pageInfoStrings.stocktake_name}:`,
    info: pageObject.name,
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.STOCKTAKE_NAME_EDIT)),
    editableType: 'text',
  },
  itemName: {
    title: `${tableStrings.item_name}`,
    info: pageObject.itemName,
    onPress: null,
  },
});

const getPageInfoColumns = page => {
  const pageInfoColumns = PER_PAGE_INFO_COLUMNS[page];

  if (!pageInfoColumns) return null;
  return (pageObjectParameter, dispatch, PageActions) => {
    const pageInfoRows = PAGE_INFO_ROWS(pageObjectParameter, dispatch, PageActions);
    return pageInfoColumns.map(pageInfoColumn =>
      pageInfoColumn.map(pageInfoKey => pageInfoRows[pageInfoKey])
    );
  };
};

export default getPageInfoColumns;
