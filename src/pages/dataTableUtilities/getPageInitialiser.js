/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../database';

import { sortDataBy } from '../../utilities';
import { recordKeyExtractor } from './utilities';
import getColumns from './getColumns';
import getPageInfoColumns from './getPageInfoColumns';

import { COLUMN_KEYS } from './constants';
import { ROUTES } from '../../navigation/constants';
import { SETTINGS_KEYS } from '../../settings';

export const cashRegisterInitialiser = () => {
  const backingData = UIDatabase.objects('CashTransaction');
  const filteredData = backingData.slice();
  const sortedData = sortDataBy(filteredData, COLUMN_KEYS.SERIAL_NUMBER, false);
  const paymentTypes = UIDatabase.objects('PaymentType');
  return {
    paymentTypes,
    currentPaymentType: paymentTypes[0],
    backingData,
    data: sortedData,
    dataState: new Map(),
    searchTerm: '',
    sortKey: COLUMN_KEYS.SERIAL_NUMBER,
    isAscending: true,
    keyExtractor: recordKeyExtractor,
    modalKey: '',
    columns: getColumns(ROUTES.CASH_REGISTER),
    transactionType: 'payment',
    route: ROUTES.CASH_REGISTER,
  };
};

/**
 * Gets data for initialising a customer invoice page from an associated transaction.
 *
 * @param    {Transaction}  transaction
 * @returns  {object}
 */
export const customerInvoiceInitialiser = transaction => {
  const { items: backingData } = transaction;

  const sortedData = backingData.sorted('item.name').slice();

  return {
    pageObject: transaction,
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['item.name', 'item.code'],
    sortKey: 'itemName',
    isAscending: true,
    modalKey: '',
    modalValue: null,
    hasSelection: false,
    route: ROUTES.CUSTOMER_INVOICE,
    columns: getColumns(ROUTES.CUSTOMER_INVOICE),
    getPageInfoColumns: getPageInfoColumns(ROUTES.CUSTOMER_INVOICE),
  };
};

/**
 * Gets data for initialising a customer invoices page.
 * Invoices shown initially are unfinalised and sorted by serial number.
 *
 * @returns  {object}
 */
export const customerInvoicesInitialiser = () => {
  const backingData = UIDatabase.objects('CustomerInvoice');
  const filteredData = backingData.filtered('status != $0', 'finalised').slice();
  const sortedData = sortDataBy(filteredData, 'serialNumber', false);

  return {
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['otherParty.name'],
    sortKey: 'serialNumber',
    isAscending: false,
    modalKey: '',
    hasSelection: false,
    route: ROUTES.CUSTOMER_INVOICES,
    columns: getColumns(ROUTES.CUSTOMER_INVOICES),
    getPageInfoColumns: getPageInfoColumns(ROUTES.CUSTOMER_INVOICES),
  };
};

/**
 * Gets data for initialising a customer requisition page from an associated requisition.
 *
 * @param    {Requisition}  requisition
 * @returns  {object}
 */
const customerRequisitionInitialiser = requisition => {
  const { indicators, items: backingData } = requisition;
  const sortedData = backingData.sorted('item.name').slice();

  const usingIndicators = !!indicators?.length;
  const [currentIndicator = null] = indicators || [];
  const indicatorRows = currentIndicator?.rows;
  const indicatorColumns = currentIndicator?.columns;

  return {
    pageObject: requisition,
    backingData: requisition.items,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['item.name', 'item.code'],
    sortKey: 'itemName',
    isAscending: true,
    modalKey: '',
    modalValue: null,
    usingIndicators,
    showIndicators: false,
    currentIndicator,
    indicatorColumns,
    indicatorRows,
    indicators,
    route: ROUTES.CUSTOMER_REQUISITION,
    columns: getColumns(ROUTES.CUSTOMER_REQUISITION),
    getPageInfoColumns: getPageInfoColumns(ROUTES.CUSTOMER_REQUISITION),
  };
};

/**
 * Gets data for initialising a customer requisitions page.
 *
 * @returns  {object}
 */
const customerRequisitionsInitialiser = () => {
  const backingData = UIDatabase.objects('ResponseRequisition');

  const filteredData = backingData.filtered('status != $0', 'finalised');
  const sortedData = sortDataBy(filteredData.slice(), 'serialNumber', false);

  return {
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    searchTerm: '',
    filterDataKeys: ['serialNumber'],
    sortKey: 'serialNumber',
    isAscending: false,
    route: ROUTES.CUSTOMER_REQUISITIONS,
    columns: getColumns(ROUTES.CUSTOMER_REQUISITIONS),
    getPageInfoColumns: getPageInfoColumns(ROUTES.CUSTOMER_REQUISITIONS),
  };
};

/**
 * Gets data for initialising a stock page.
 *
 * @returns  {object}
 */
const stockInitialiser = () => {
  const backingData = UIDatabase.objects('Item').sorted('name');

  return {
    backingData,
    data: backingData.slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['name', 'code'],
    sortKey: 'name',
    isAscending: true,
    selectedRow: null,
    route: ROUTES.STOCK,
  };
};

/**
 * Gets data for initialising a stocktakes page.
 * Initial data is unfinalised stocktakes, sorted by creation date.
 *
 * @returns  {object}
 */
const stocktakesInitialiser = () => {
  const backingData = UIDatabase.objects('Stocktake');

  const filteredData = backingData.filtered('status != $0', 'finalised');
  const sortedData = filteredData.sorted('createdDate', true).slice();

  return {
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['name', 'serialNumber'],
    sortKey: 'createdDate',
    isAscending: false,
    modalKey: '',
    hasSelection: false,
    route: ROUTES.STOCKTAKES,
    columns: getColumns(ROUTES.STOCKTAKES),
    getPageInfoColumns: getPageInfoColumns(ROUTES.STOCKTAKES),
  };
};

/**
 * Gets data for initialising a stocktake batch page from an associated stocktake item.
 *
 * @param    {StocktakeItem}  stocktakeItem
 * @returns  {object}
 */
const stocktakeBatchInitialiser = stocktakeItem => {
  const thisStoreNameId = UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_NAME_ID);
  const suppliers = UIDatabase.objects('Name').filtered(
    '(isVisible == true AND isSupplier == true AND id != $0) OR (type == "inventory_adjustment")',
    thisStoreNameId
  );

  return {
    pageObject: stocktakeItem,
    backingData: stocktakeItem.batches,
    data: stocktakeItem.batches.slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    sortKey: 'itemName',
    isAscending: true,
    modalKey: '',
    modalValue: null,
    columns: getColumns(ROUTES.CUSTOMER_INVOICE),
    getPageInfoColumns: getPageInfoColumns(ROUTES.CUSTOMER_INVOICE),
    suppliers,
  };
};

/**
 * Gets data for initialising a manage stocktake page from an associated stocktake item.
 *
 * @param    {Stocktake}  stocktake
 * @returns  {object}
 */
const stocktakeManagerInitialiser = stocktake => {
  const backingData = UIDatabase.objects('Item');

  return {
    stocktake,
    backingData,
    data: backingData.sorted('name').slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['name', 'code'],
    name: stocktake ? stocktake.name : '',
    sortKey: 'name',
    isAscending: true,
    hasSelection: false,
    allSelected: false,
    showAll: true,
    route: ROUTES.STOCKTAKE_MANAGER,
    columns: getColumns(ROUTES.STOCKTAKE_MANAGER),
    getPageInfoColumns: getPageInfoColumns(ROUTES.STOCKTAKE_MANAGER),
  };
};

/**
 * Gets data for initialising an edit stocktake page from an associated stocktake item.
 *
 * @param    {Stocktake}  stocktake
 * @returns  {object}
 */
const stocktakeEditorInitialiser = stocktake => {
  const { items: backingData } = stocktake;
  const sortedData = backingData.sorted('item.name').slice();

  const hasNegativeAdjustmentReasons = UIDatabase.objects('NegativeAdjustmentReason').length > 0;
  const hasPositiveAdjustmentReasons = UIDatabase.objects('PositiveAdjustmentReason').length > 0;
  const usesReasons = hasNegativeAdjustmentReasons && hasPositiveAdjustmentReasons;

  const customCode = usesReasons ? ROUTES.STOCKTAKE_EDITOR_WITH_REASONS : ROUTES.STOCKTAKE_EDITOR;

  return {
    pageObject: stocktake,
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['item.name', 'item.code'],
    sortKey: 'itemName',
    isAscending: true,
    modalKey: '',
    modalValue: null,
    route: ROUTES.STOCKTAKE_EDITOR,
    columns: getColumns(customCode),
    getPageInfoColumns: getPageInfoColumns(customCode),
  };
};

/**
 * Gets data for initialising an edit stocktake page when reasons
 * are defined from an associated stocktake.
 *
 * @param    {Stocktake}  stocktake
 * @returns  {object}
 */
const stocktakeEditorWithReasonsInitialiser = stocktake => {
  const { items: backingData } = stocktake;
  const sortedData = backingData.sorted('item.name').slice();

  return {
    pageObject: stocktake,
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['item.name', 'item.code'],
    sortKey: 'itemName',
    isAscending: true,
    modalKey: '',
    modalValue: null,
    route: ROUTES.STOCKTAKE_EDITOR_WITH_REASONS,
    columns: getColumns(ROUTES.STOCKTAKE_EDITOR_WITH_REASONS),
    getPageInfoColumns: getPageInfoColumns(ROUTES.STOCKTAKE_EDITOR_WITH_REASONS),
  };
};

/**
 * Gets data for initialising a supplier invoice page from an associated transaction item.
 *
 * @param    {Transaction}  transaction
 * @returns  {object}
 */
const supplierInvoiceInitialiser = transaction => {
  const backingData = transaction.getTransactionBatches(UIDatabase);

  const sortedData = backingData.sorted('itemName').slice();

  const pageInfoConstant = transaction.isSupplierInvoice
    ? ROUTES.SUPPLIER_INVOICE
    : 'supplierCredit';

  return {
    pageObject: transaction,
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['itemName'],
    sortKey: 'itemName',
    isAscending: true,
    modalKey: '',
    modalValue: null,
    hasSelection: false,
    route: ROUTES.SUPPLIER_INVOICE,
    columns: getColumns(ROUTES.SUPPLIER_INVOICE),
    getPageInfoColumns: getPageInfoColumns(pageInfoConstant),
  };
};

/**
 * Gets data for initialising a supplier invoices page.
 * Data is initially unfinalised and sorted by serial number.
 *
 * @returns  {object}
 */
const supplierInvoicesInitialiser = () => {
  const backingData = UIDatabase.objects('SupplierTransaction');

  const filteredData = backingData.filtered('status != $0', 'finalised').slice();
  const sortedData = sortDataBy(filteredData, 'serialNumber', false);

  return {
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber'],
    sortKey: 'serialNumber',
    isAscending: false,
    modalKey: '',
    hasSelection: false,
    route: ROUTES.SUPPLIER_INVOICES,
    columns: getColumns(ROUTES.SUPPLIER_INVOICES),
    getPageInfoColumns: getPageInfoColumns(ROUTES.SUPPLIER_INVOICES),
  };
};

/**
 * Gets data for initialising a supplier requisition page from an associated requisition.
 *
 * @param    {Requisition}  requisition
 * @returns  {object}
 */
const supplierRequisitionInitialiser = requisition => {
  const { isFinalised, program, items: backingData, indicators } = requisition;

  const usingPrograms = !!program;
  const route = program ? ROUTES.SUPPLIER_REQUISITION_WITH_PROGRAM : ROUTES.SUPPLIER_REQUISITION;

  const sortedData = backingData.sorted('item.name').slice();
  const filteredData =
    !usingPrograms || isFinalised
      ? sortedData
      : sortedData.filter(item => item.isLessThanThresholdMOS);

  const usingIndicators = !!indicators?.length;
  const [currentIndicator = null] = indicators || [];
  const indicatorRows = currentIndicator?.rows;
  const indicatorColumns = currentIndicator?.columns;

  return {
    pageObject: requisition,
    backingData,
    data: filteredData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['item.name', 'item.code'],
    sortKey: 'itemName',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
    modalValue: null,
    usingIndicators,
    showIndicators: false,
    currentIndicator,
    indicatorColumns,
    indicatorRows,
    indicators,
    showAll: !usingPrograms || isFinalised,
    route: ROUTES.SUPPLIER_REQUISITION,
    columns: getColumns(route),
    getPageInfoColumns: getPageInfoColumns(route),
  };
};

/**
 * Gets data for initialising a supplier requisitions page.
 * Initial data are unfinalised requisitions, sorted by serial number.
 *
 * @returns  {object}
 */
const supplierRequisitionsInitialiser = () => {
  const backingData = UIDatabase.objects('RequestRequisition');

  const filteredData = backingData.filtered('status != $0', 'finalised').slice();
  const sortedData = sortDataBy(filteredData, 'serialNumber', false);

  return {
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber'],
    sortKey: 'serialNumber',
    isAscending: false,
    modalKey: '',
    hasSelection: false,
    route: ROUTES.SUPPLIER_REQUISITIONS,
    columns: getColumns(ROUTES.SUPPLIER_REQUISITIONS),
    getPageInfoColumns: getPageInfoColumns(ROUTES.SUPPLIER_REQUISITIONS),
  };
};

const pageInitialisers = {
  customerInvoice: customerInvoiceInitialiser,
  customerInvoices: customerInvoicesInitialiser,
  customerRequisition: customerRequisitionInitialiser,
  customerRequisitions: customerRequisitionsInitialiser,
  stock: stockInitialiser,
  stocktakeBatchEditModal: stocktakeBatchInitialiser,
  stocktakeBatchEditModalWithReasons: stocktakeBatchInitialiser,
  stocktakeBatchEditModalWithPrices: stocktakeBatchInitialiser,
  stocktakeBatchEditModalWithReasonsAndPrices: stocktakeBatchInitialiser,
  stocktakeEditor: stocktakeEditorInitialiser,
  stocktakeEditorWithReasons: stocktakeEditorWithReasonsInitialiser,
  stocktakeManager: stocktakeManagerInitialiser,
  stocktakes: stocktakesInitialiser,
  supplierInvoice: supplierInvoiceInitialiser,
  supplierInvoices: supplierInvoicesInitialiser,
  supplierRequisition: supplierRequisitionInitialiser,
  supplierRequisitions: supplierRequisitionsInitialiser,
  cashRegister: cashRegisterInitialiser,
};

/**
 * A wrapper for mapping pages to initialisation functions.
 *
 * @param    {object}    A mapper from page names to initialisation functions.
 * @returns  {Function}  A lookup function for retrieving page initialisers.
 */
const getPageInitialiser = pageToInitialiser => page => pageToInitialiser[page];

export default getPageInitialiser(pageInitialisers);
