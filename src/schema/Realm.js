import Realm from 'realm';

class Address {};
Address.schema = {
  name: 'Address',
  properties: {
    id: 'string',
    line1: 'string',
    line2: 'string',
    line3: 'string'
  }
}

class Item {};
Item.schema = {
  name: 'Item',
  properties: {
    id: 'string',
    code: 'string',
    name: 'string',
    defaultPackSize: 'double',
    lines: { type:'list', objectType: 'ItemLine' },
    typeOf: 'string',
    department: 'ItemDepartment',
    description: 'string',
    category: 'ItemCategory'
  }
}

class ItemLine {};
ItemLine.schema = {
  name: 'ItemLine',
  properties: {
    id: 'string',
    item: 'Item',
    packSize: 'double',
    numberOfPacks: 'double',
    totalQuantity: 'double',  // Should be kept consistent with packSize x numberOfPacks
    expiryDate: 'date',
    batch: 'string',
    costPrice: 'double',
    sellPrice: 'double'
  }
}

class ItemDepartment {};
ItemDepartment.schema = {
  name: 'ItemDepartment',
  properties: {
    id: 'string',
    name: 'string',
    parentDepartment: 'ItemDepartment'
  }
}

class ItemCategory {};
ItemCategory.schema = {
  name: 'ItemCategory',
  properties: {
    id: 'string',
    name: 'string',
    parentCategory: 'ItemCategory'
  }
}

class Invoice {};
class CustomerInvoice extends Invoice {};
class SupplierInvoice extends Invoice {};
Invoice.schema = {
  name: 'Invoice',
  properties: {
    id: 'string',
    serialNumber: 'int',
    otherParty: 'Name',
    comment: 'string',
    entryDate: 'date',
    type: 'string',
    status: 'string',
    confirmDate: 'date',
    enteredBy: 'User',
    theirRef: 'string', // An external reference code
    lines: {type: 'list', objectType: 'InvoiceLine'}
  }
}

class InvoiceCategory {};
InvoiceCategory.schema = {
  name: 'InvoiceCategory',
  properties: {
    id: 'string',
    name: 'string',
    parentCategory: 'InvoiceCategory'
  }
}

class InvoiceLine {};
InvoiceLine.schema = {
  name: 'InvoiceLine',
  properties: {
    id: 'string',
    itemLine: 'ItemLine',
    packSize: 'double',
    numberOfPacks: 'double',
    invoice: 'Invoice',
  }
}

class MasterList {};
MasterList.schema = {
  name: 'MasterList',
  properties: {
    id: 'string',
    name: 'string',
    description: 'string',
    lines: {type: 'list', objectType: 'MasterListLine'}
  }
}

class MasterListLine {};
MasterListLine.schema = {
  name: 'MasterListLine',
  properties: {
    id: 'string',
    masterList: 'MasterList',
    item: 'Item',
    imprestQuantity: 'double'
  }
}

class Name {};
class Customer extends Name {};
class Supplier extends Name {};
Name.schema = {
  name: 'Name',
  properties: {
    id: 'string',
    name: 'string',
    code: 'string',
    phoneNumber: 'string',
    billingAddress: 'Address',
    type: 'string',
    masterList: 'MasterList',
    invoices: {type: 'list', objectType: 'Invoice'}
  }
}

class Requisition {};
Requisition.schema = {
  name: 'Requisition',
  properties: {
    id: 'string',
    status: 'string',
    entryDate: 'date',
    monthsToSupply: 'double',
    serialNumber: 'int',
    lines: {type: 'list', objectType: 'RequisitionLine'}
  }
}

class RequisitionLine {};
RequisitionLine.schema = {
  name: 'RequisitionLine',
  properties: {
    id: 'string',
    requisition: 'Requisition',
    item: 'Item',
    stockOnHand: 'double',
    monthlyUsage: 'double',
    suggestedQuantity: 'double',
    imprestQuantity: 'double',
    requiredQuantity: 'double',
    comment: 'string'
  }
}


class SyncOut {};
SyncOut.schema = {
  name: 'SyncOut',
  properties: {
    id: 'string',
    recordType: 'string', // i.e. Table name
    recordId: 'string'
  }
}

class Stocktake {};
Stocktake.schema = {
  name: 'Stocktake',
  properties: {
    id: 'string',
    createdDate: 'date', // Includes time
    stocktakeDate: 'date',
    status: 'string',
    created_by: 'User',
    finalised_by: 'User',
    comment: 'string',
    serialNumber: 'int'
  }
}

class StocktakeLine {};
StocktakeLine.schema = {
  name: 'StocktakeLine',
  properties: {
    id: 'string',
    stocktake: 'Stocktake',
    itemLine: 'ItemLine',
    snapshotQuantity: 'double',
    snapshotPacksize: 'double',
    countedQuantity: 'double'
  }
}

class User {};
User.schema = {
  name: 'User',
  properties: {
    id: 'string',
    username: 'string',
    lastLogin: 'date',
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    password: 'string',
    salt: 'string'
  }
}

const schema =
  [
    Address,
    Item,
    ItemLine,
    ItemDepartment,
    ItemCategory,
    Invoice,
    InvoiceLine,
    MasterList,
    MasterListLine,
    Name,
    Requisition,
    RequisitionLine,
    SyncOut,
    Stocktake,
    StocktakeLine,
    User
  ];

export default new Realm({schema: schema, schemaVersion: 1});
