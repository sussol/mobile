/* eslint-disable dot-notation */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { generalStrings, pageInfoStrings, programStrings, tableStrings } from '../../localization';
import { MODAL_KEYS, formatDate } from '../../utilities';
import { ROUTES } from '../../navigation/constants';
import { MODALS } from '../../widgets/constants';
import { PageActions } from './actions';
import { formatTemperatureExposure, formatTimeDifference } from '../../utilities/formatters';
import { UIDatabase } from '../../database';
import { NUMBER_OF_DAYS_IN_A_MONTH } from '../../database/utilities';

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
  [ROUTES.CUSTOMER_INVOICE_WITH_VACCINES]: [
    ['entryDate', 'confirmDate', 'enteredBy'],
    ['customer', 'theirRef', 'transactionComment'],
  ],
  [ROUTES.SUPPLIER_INVOICE]: [
    ['entryDate', 'confirmDate'],
    ['otherParty', 'theirRef', 'transactionComment'],
  ],
  [ROUTES.SUPPLIER_INVOICE_WITH_VACCINES]: [
    ['entryDate', 'confirmDate'],
    ['otherParty', 'theirRef', 'transactionComment'],
  ],
  [ROUTES.SUPPLIER_INVOICE_WITH_PRICES]: [
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
  [ROUTES.CUSTOMER_REQUISITION]: [
    ['monthsToSupply', 'entryDate'],
    ['customer', 'requisitionComment'],
  ],
  [ROUTES.CUSTOMER_REQUISITIONS_WITH_PROGRAMS]: [
    ['program', 'orderType', 'monthsToSupply', 'entryDate'],
    ['customer', 'requisitionComment', 'period'],
  ],
  [ROUTES.PRESCRIPTION]: [
    ['entryDate', 'enteredBy'],
    ['customer', 'transactionComment', 'prescriber'],
  ],
  [MODALS.STOCKTAKE_BATCH_EDIT]: [['itemName']],
  [MODALS.STOCKTAKE_BATCH_EDIT_WITH_REASONS]: [['itemName']],
  [MODALS.STOCKTAKE_BATCH_EDIT_WITH_PRICES]: [['itemName']],
  [MODALS.STOCKTAKE_BATCH_EDIT_WITH_REASONS_AND_PRICES]: [['itemName']],
  [MODALS.STOCKTAKE_BATCH_EDIT_WITH_VACCINES]: [['itemName']],
  [ROUTES.SUPPLIER_CREDIT]: [
    ['entryDate', 'confirmDate', 'transactionCategory'],
    ['enteredBy', 'otherParty'],
  ],
  supplierRequisitionItemDetail: [['lastRequisitionDate', 'openVialWastage', 'closedVialWastage']],
  breach: [
    ['breachTemperatureRange'],
    ['breachDuration', 'location'],
    ['numberOfAffectedBatches', 'affectedQuantity'],
  ],
  customerRequisitionItemDetail: [
    [
      'customerRequisitionProgramSuggestedFormulaString',
      'customerRequisitionProgramSuggestedFormula',
      'customerRequisitionProgramAMCFormulaString',
      'customerRequisitionProgramAMCFormula',
    ],
  ],
};

const PAGE_INFO_ROWS = (pageObject, dispatch, route) => ({
  customerRequisitionProgramSuggestedFormulaString: {
    title: ` ${pageInfoStrings.suggested_equals}`,
    info: `${pageInfoStrings.suggested_formula}`,
  },
  customerRequisitionProgramSuggestedFormula: {
    title: `${pageObject.suggestedQuantity?.toFixed(2)} =`,
    info: `${pageObject.outgoingStock} / (${pageObject.numberOfDaysInPeriod} - ${pageObject.daysOutOfStock})`,
  },
  customerRequisitionProgramAMCFormulaString: {
    title: `${pageInfoStrings.amc_equals}`,
    info: `${pageInfoStrings.amc_formula}`,
  },
  customerRequisitionProgramAMCFormula: {
    title: `${(
      (pageObject.outgoingStock * NUMBER_OF_DAYS_IN_A_MONTH) /
      (pageObject.numberOfDaysInPeriod - pageObject.daysOutOfStock)
    )?.toFixed(2)} = `,
    info: `${pageObject.outgoingStock?.toFixed(2)} x ${NUMBER_OF_DAYS_IN_A_MONTH?.toFixed(2)} / ${
      pageObject.numberOfDaysInPeriod
    } - ${pageObject.daysOutOfStock}`,
  },

  lastRequisitionDate: {
    title: `${pageInfoStrings.last_requisition_date}:`,
    info: formatDate(pageObject?.lastRequisitionDate, 'll') || generalStrings.not_available,
  },
  openVialWastage: {
    title: `${pageInfoStrings.open_vial_wastage}:`,
    info: pageObject?.isVaccine
      ? pageObject?.openVialWastage?.(pageObject.lastRequisitionDate)
      : generalStrings.not_available,
  },
  closedVialWastage: {
    title: `${pageInfoStrings.closed_vial_wastage}:`,
    info: pageObject?.isVaccine
      ? pageObject?.closedVialWastage?.(pageObject.lastRequisitionDate)
      : generalStrings.not_available,
  },
  breachTemperatureRange: {
    title: `${pageInfoStrings.temperature_range}:`,
    info: formatTemperatureExposure(pageObject.temperatureExposure),
  },
  numberOfAffectedBatches: {
    title: `${pageInfoStrings.number_of_affected_batches}:`,
    info: pageObject?.numberOfAffectedBatches?.(UIDatabase),
  },
  breachDuration: {
    title: `${pageInfoStrings.duration}:`,
    info: pageObject.duration ? formatTimeDifference(pageObject.duration) : '',
  },
  location: {
    title: `${pageInfoStrings.location}:`,
    info: pageObject.locationString,
  },
  affectedQuantity: {
    title: `${pageInfoStrings.affected_quantity}:`,
    info: pageObject?.affectedQuantity?.(UIDatabase),
  },
  entryDate: {
    title: `${pageInfoStrings.entry_date}:`,
    info: formatDate(pageObject.entryDate) || 'N/A',
  },
  confirmDate: {
    title: `${pageInfoStrings.confirm_date}:`,
    info: formatDate(pageObject.confirmDate),
  },
  transactionCategory: {
    title: `${pageInfoStrings.category}:`,
    info: pageObject?.category?.name ?? '',
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
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.THEIR_REF_EDIT, route)),
    editableType: 'text',
  },
  transactionComment: {
    title: `${pageInfoStrings.comment}:`,
    info: pageObject.comment,
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.TRANSACTION_COMMENT_EDIT, route)),
    editableType: 'text',
  },
  stocktakeComment: {
    title: `${pageInfoStrings.comment}:`,
    info: pageObject.comment,
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.STOCKTAKE_COMMENT_EDIT, route)),
    editableType: 'text',
  },
  requisitionComment: {
    title: `${pageInfoStrings.comment}:`,
    info: pageObject.comment,
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.REQUISITION_COMMENT_EDIT, route)),
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
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_MONTH, route)),
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
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.STOCKTAKE_NAME_EDIT, route)),
    editableType: 'text',
  },
  itemName: {
    title: `${tableStrings.item_name}`,
    info: pageObject.itemName,
    onPress: null,
  },
  prescriber: {
    title: 'Prescriber',
    info: pageObject?.prescriber?.firstName,
    onPress: () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_PRESCRIBER, route)),
  },
  number: {
    title: 'Number',
    info: pageObject.number,
    onPress: null,
  },
  name: {
    title: 'Name',
    info: pageObject.name,
    onPress: null,
  },
  type: {
    title: 'Type',
    info: pageObject.type,
    onPress: null,
  },
  reason: {
    title: 'Defined Reason',
    info: pageObject.reasonTitle,
    onPress: null,
  },
  comment: {
    title: 'Comment',
    info: pageObject.comment,
    onPress: null,
  },
  status: {
    title: 'Status',
    info: pageObject.status,
    onPress: null,
  },
});

const getPageInfoColumns = (page, isProgramBased) => {
  const pageInfoColumns = PER_PAGE_INFO_COLUMNS[page];

  if (!pageInfoColumns) return null;

  return (pageObjectParameter, dispatch, route) => {
    const pageInfoRows = PAGE_INFO_ROWS(pageObjectParameter, dispatch, route);
    return pageInfoColumns.map((pageInfoColumn, idx) => {
      const columnArray =
        isProgramBased && idx === 0 ? ['program', ...pageInfoColumn] : pageInfoColumn;
      return columnArray.map(pageInfoKey => pageInfoRows[pageInfoKey]);
    });
  };
};

export default getPageInfoColumns;
