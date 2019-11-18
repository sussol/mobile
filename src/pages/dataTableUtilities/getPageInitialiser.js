/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../database';
import Settings from '../../settings/MobileAppSettings';

import { sortDataBy, getAllPrograms } from '../../utilities';
import { recordKeyExtractor } from './utilities';

/**
 * Gets data for initialising a customer invoice page from an associated transaction.
 *
 * @param    {Transaction}  transaction
 * @returns  {object}
 */
const customerInvoiceInitialiser = transaction => {
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
  };
};

/**
 * Gets data for initialising a customer invoices page.
 * Invoices shown initially are unfinalised and sorted by serial number.
 *
 * @returns  {object}
 */
const customerInvoicesInitialiser = () => {
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
  };
};

/**
 * Gets data for initialising a customer requisition page from an associated requisition.
 *
 * @param    {Requisition}  requisition
 * @returns  {object}
 */
const customerRequisitionInitialiser = requisition => {
  const { items: backingData } = requisition;
  const sortedData = backingData.sorted('item.name').slice();

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

  // Determine if programs are being used so the manage stocktake button can be hidden.
  const usingPrograms = getAllPrograms(Settings, UIDatabase).length > 0;

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
    usingPrograms,
  };
};

/**
 * Gets data for initialising a stocktake batch page from an associated stocktake item.
 *
 * @param    {StocktakeItem}  stocktakeItem
 * @returns  {object}
 */
const stocktakeBatchInitialiser = stocktakeItem => ({
  pageObject: stocktakeItem,
  backingData: stocktakeItem.batches,
  data: stocktakeItem.batches.slice(),
  keyExtractor: recordKeyExtractor,
  dataState: new Map(),
  sortKey: 'itemName',
  isAscending: true,
  modalKey: '',
  modalValue: null,
});

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
  };
};

/**
 * Gets data for initialising a supplier invoices page.
 * Data is initially unfinalised and sorted by serial number.
 *
 * @returns  {object}
 */
const supplierInvoicesInitialiser = () => {
  const backingData = UIDatabase.objects('SupplierInvoice');

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
  };
};

/**
 * Gets data for initialising a supplier requisition page from an associated requisition.
 *
 * @param    {Requisition}  requisition
 * @returns  {object}
 */
const supplierRequisitionInitialiser = requisition => {
  const { items: backingData } = requisition;
  const sortedData = backingData.sorted('item.name').slice();

  return {
    pageObject: requisition,
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['item.name', 'item.code'],
    sortKey: 'itemName',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
    modalValue: null,
  };
};

/**
 * Gets data for initialising a supplier requisition page from an associated requisition
 * which has a related program.
 *
 * @param    {Requisition}  requisition
 * @returns  {object}
 */
const supplierRequisitionWithProgramInitialiser = requisition => {
  const { program, items: backingData } = requisition;
  const showAll = !program;

  return {
    pageObject: requisition,
    backingData,
    data: backingData.filter(item => item.isLessThanThresholdMOS),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['item.name', 'item.code'],
    sortKey: 'itemName',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
    showAll,
    modalValue: null,
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
  stocktakeEditor: stocktakeEditorInitialiser,
  stocktakeEditorWithReasons: stocktakeEditorInitialiser,
  stocktakeManager: stocktakeManagerInitialiser,
  stocktakes: stocktakesInitialiser,
  supplierInvoice: supplierInvoiceInitialiser,
  supplierInvoices: supplierInvoicesInitialiser,
  supplierRequisition: supplierRequisitionInitialiser,
  supplierRequisitionWithProgram: supplierRequisitionWithProgramInitialiser,
  supplierRequisitions: supplierRequisitionsInitialiser,
};

/**
 * A wrapper for mapping pages to initialisation functions.
 *
 * @param    {object}    A mapper from page names to initialisation functions.
 * @returns  {Function}  A lookup function for retrieving page initialisers.
 */
const getPageInitialiser = pageToInitialiser => page => pageToInitialiser[page];

export default getPageInitialiser(pageInitialisers);
