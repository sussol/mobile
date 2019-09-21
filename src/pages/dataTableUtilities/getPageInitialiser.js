/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../database';
import Settings from '../../settings/MobileAppSettings';

import { newSortDataBy, getAllPrograms } from '../../utilities';
import { recordKeyExtractor } from './utilities';

/**
 * Gets data for initialising a customer invoice page from an associated transaction.
 *
 * @param    {Transaction}  transaction
 * @returns  {object}
 */
const customerInvoiceInitialiser = transaction => ({
  pageObject: transaction,
  backingData: transaction.items,
  data: transaction.items.sorted('item.name').slice(),
  keyExtractor: recordKeyExtractor,
  dataState: new Map(),
  searchTerm: '',
  filterDataKeys: ['item.name', 'item.code'],
  sortBy: 'itemName',
  isAscending: true,
  modalKey: '',
  modalValue: null,
  hasSelection: false,
});

/**
 * Gets data for initialising a customer invoices page.
 *
 * @returns  {object}
 */
const customerInvoicesInitialiser = () => {
  const backingData = UIDatabase.objects('CustomerInvoice');
  const filteredData = backingData.filtered('status != $0', 'finalised').slice();
  return {
    backingData,
    data: newSortDataBy(filteredData, 'serialNumber', false),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['otherParty.name'],
    sortBy: 'serialNumber',
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
const customerRequisitionInitialiser = requisition => ({
  pageObject: requisition,
  backingData: requisition.items,
  data: requisition.items.sorted('item.name').slice(),
  keyExtractor: recordKeyExtractor,
  dataState: new Map(),
  searchTerm: '',
  filterDataKeys: ['item.name', 'item.code'],
  sortBy: 'itemName',
  isAscending: true,
  modalKey: '',
  modalValue: null,
});

/**
 * Gets data for initialising a customer requisitions page.
 *
 * @returns  {object}
 */
const customerRequisitionsInitialiser = () => {
  const backingData = UIDatabase.objects('ResponseRequisition');
  const data = newSortDataBy(backingData.slice(), 'serialNumber', false);
  return {
    backingData,
    data,
    keyExtractor: recordKeyExtractor,
    searchTerm: '',
    filterDataKeys: ['serialNumber'],
    sortBy: 'serialNumber',
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
    sortBy: 'name',
    isAscending: true,
    selectedRow: null,
  };
};

/**
 * Gets data for initialising a stocktakes page.
 *
 * @returns  {object}
 */
const stocktakesInitialiser = () => {
  const backingData = UIDatabase.objects('Stocktake');
  return {
    backingData,
    data: backingData
      .filtered('status != $0', 'finalised')
      .sorted('createdDate', true)
      .slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['name', 'serialNumber'],
    sortBy: 'createdDate',
    isAscending: false,
    modalKey: '',
    hasSelection: false,
    usingPrograms: getAllPrograms(Settings, UIDatabase).length > 0,
  };
};

/**
 * Gets data for initialising a stocktake batch page from an associated stocktake item.
 *
 * @param    {StocktakeItem}  stocktakeItem
 * @returns  {object}
 */
const stocktakeBatchInitialiser = stocktakeItem => ({
  stocktakeItem,
  backingData: stocktakeItem.batches,
  data: stocktakeItem.batches.slice(),
  keyExtractor: recordKeyExtractor,
  dataState: new Map(),
  sortBy: 'itemName',
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
    sortBy: 'name',
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
  const filteredData = backingData.sorted('item.name').filtered('status != $0', 'finalised');

  return {
    pageObject: stocktake,
    backingData: stocktake.items,
    data: filteredData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['item.name', 'item.code'],
    sortBy: 'itemName',
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
  return {
    pageObject: transaction,
    backingData,
    data: backingData.sorted('itemName').slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['itemName'],
    sortBy: 'itemName',
    isAscending: true,
    modalKey: '',
    modalValue: null,
    hasSelection: false,
  };
};

/**
 * Gets data for initialising a supplier invoices page.
 *
 * @returns  {object}
 */
const supplierInvoicesInitialiser = () => {
  const backingData = UIDatabase.objects('SupplierInvoice');
  const filteredData = backingData.filtered('status != $0', 'finalised').slice();
  return {
    backingData,
    data: newSortDataBy(filteredData, 'serialNumber', false),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber'],
    sortBy: 'serialNumber',
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
    sortBy: 'itemName',
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
    sortBy: 'itemName',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
    showAll,
    modalValue: null,
  };
};

/**
 * Gets data for initialising a supplier requisitions page.
 *
 * @returns  {object}
 */
const supplierRequisitionsInitialiser = () => {
  const backingData = UIDatabase.objects('RequestRequisition');

  const filteredData = backingData.filtered('status != $0', 'finalised').slice();
  const sortedData = newSortDataBy(filteredData, 'serialNumber', false);

  return {
    backingData,
    data: sortedData,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber'],
    sortBy: 'serialNumber',
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
