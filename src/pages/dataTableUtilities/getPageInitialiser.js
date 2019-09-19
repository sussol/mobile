/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../database';
import Settings from '../../settings/MobileAppSettings';

import { newSortDataBy, getAllPrograms } from '../../utilities';
import { recordKeyExtractor } from './utilities';

const customerInvoiceInitialiser = pageObject => ({
  pageObject,
  backingData: pageObject.items,
  data: pageObject.items.sorted('item.name').slice(),
  keyExtractor: recordKeyExtractor,
  dataState: new Map(),
  searchTerm: '',
  filterDataKeys: ['item.name'],
  sortBy: 'itemName',
  isAscending: true,
  modalKey: '',
  modalValue: null,
  hasSelection: false,
});

const customerInvoicesInitialiser = () => {
  const backingData = UIDatabase.objects('CustomerInvoice');
  return {
    backingData,
    data: newSortDataBy(backingData.slice(), 'serialNumber', false),
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

const customerRequisitionInitialiser = pageObject => ({
  pageObject,
  backingData: pageObject.items,
  data: pageObject.items.sorted('item.name').slice(),
  keyExtractor: recordKeyExtractor,
  dataState: new Map(),
  searchTerm: '',
  filterDataKeys: ['item.name', 'item.code'],
  sortBy: 'itemName',
  isAscending: true,
  modalKey: '',
});

const customerRequisitionsInitialiser = () => {
  const backingData = UIDatabase.objects('ResponseRequisition');
  const data = newSortDataBy(backingData.slice(), 'serialNumber', false);
  return {
    backingData,
    data,
    keyExtractor: recordKeyExtractor,
    searchTerm: '',
    filterDataKeys: ['serialNumber', 'otherStoreName.name'],
    sortBy: 'serialNumber',
    isAscending: false,
  };
};

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
    filterDataKeys: ['name'],
    sortBy: 'createdDate',
    isAscending: false,
    modalKey: '',
    hasSelection: false,
    usingPrograms: getAllPrograms(Settings, UIDatabase).length > 0,
  };
};

const stocktakeManagerInitialiser = pageObject => {
  const backingData = UIDatabase.objects('Item');
  return {
    pageObject,
    backingData,
    data: backingData.sorted('name').slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['name', 'code'],
    name: pageObject ? pageObject.name : '',
    sortBy: 'name',
    isAscending: true,
    hasSelection: false,
    allSelected: false,
    showAll: true,
  };
};

const stocktakeEditorInitialiser = pageObject => ({
  pageObject,
  backingData: pageObject.items,
  data: pageObject.items.sorted('item.name').slice(),
  keyExtractor: recordKeyExtractor,
  dataState: new Map(),
  searchTerm: '',
  filterDataKeys: ['item.name'],
  sortBy: 'itemName',
  isAscending: true,
  modalKey: '',
  modalValue: null,
});

const supplierInvoiceInitialiser = pageObject => {
  const backingData = pageObject.getTransactionBatches(UIDatabase);
  return {
    pageObject,
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

const supplierInvoicesInitialiser = () => {
  const backingData = UIDatabase.objects('SupplierInvoice');
  return {
    backingData,
    data: newSortDataBy(backingData.slice(), 'serialNumber', false),
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

const supplierRequisitionInitialiser = requisition => {
  const { program, items: backingData } = requisition;
  const showAll = !program;

  return {
    pageObject: requisition,
    backingData,
    data: showAll
      ? backingData.sorted('item.name').slice()
      : backingData.filter(item => item.isLessThanThresholdMOS),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    currentFocusedRowKey: null,
    searchTerm: '',
    filterDataKeys: ['item.name'],
    sortBy: 'itemName',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
    showAll,
    modalValue: null,
  };
};

const supplierRequisitionsInitialiser = () => {
  const backingData = UIDatabase.objects('RequestRequisition');
  const data = newSortDataBy(backingData.slice(), 'serialNumber', false);
  return {
    backingData,
    data,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber', 'otherStoreName.name'],
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
  stocktakeEditor: stocktakeEditorInitialiser,
  stocktakeManager: stocktakeManagerInitialiser,
  stocktakes: stocktakesInitialiser,
  supplierInvoice: supplierInvoiceInitialiser,
  supplierInvoices: supplierInvoicesInitialiser,
  supplierRequisition: supplierRequisitionInitialiser,
  supplierRequisitions: supplierRequisitionsInitialiser,
};

const getPageInitialiser = pageToInitialiser => page => pageToInitialiser[page];

export default getPageInitialiser(pageInitialisers);
