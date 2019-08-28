/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */
import { pageInfoStrings } from '../../localization';
import { formatDate } from '../../utilities';

import { openBasicModal } from './actions';

import { MODAL_KEYS } from '../../utilities/getModalTitle';

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

const { THEIR_REF_EDIT, COMMENT_EDIT } = MODAL_KEYS;

const PER_PAGE_INFO_COLUMNS = {
  customerInvoice: [['entryDate', 'confirmDate', 'enteredBy'], ['customer', 'theirRef', 'comment']],
  supplierInvoice: [['entryDate', 'confirmDate'], ['otherParty', 'theirRef', 'comment']],
};

const PAGE_INFO_ROWS = (pageObject, dispatch) => ({
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
    info: pageObject.otherParty && pageObject.otherParty.name,
  },
  theirRef: {
    title: `${pageInfoStrings.their_ref}:`,
    info: pageObject.theirRef,
    onPress: () => dispatch(openBasicModal(THEIR_REF_EDIT)),
    editableType: 'text',
  },
  comment: {
    title: `${pageInfoStrings.comment}:`,
    info: pageObject.comment,
    onPress: () => dispatch(openBasicModal(COMMENT_EDIT)),
    editableType: 'text',
  },
  otherParty: {
    title: `${pageInfoStrings.supplier}:`,
    info: pageObject.otherParty && pageObject.otherParty.name,
  },
});

const getPageInfo = page => {
  const pageInfoColumns = PER_PAGE_INFO_COLUMNS[page];
  if (!pageInfoColumns) return null;
  return (pageObject, dispatch) => {
    const pageInfoRows = PAGE_INFO_ROWS(pageObject, dispatch);
    return pageInfoColumns.map(pageInfoColumn =>
      pageInfoColumn.map(pageInfoKey => pageInfoRows[pageInfoKey])
    );
  };
};

export default getPageInfo;
