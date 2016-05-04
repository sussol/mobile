import Realm from 'realm';

class Address {}
Address.schema = {
  name: 'Address',
  primaryKey: 'id',
  properties: {
    id: 'string',
    line1: 'string',
    line2: 'string',
    line3: 'string',
  },
};

class Item {}
Item.schema = {
  name: 'Item',
  primaryKey: 'id',
  properties: {
    id: 'string',
    code: 'string',
    name: 'string',
    defaultPackSize: 'double',
    lines: { type: 'list', objectType: 'ItemLine' },
    typeOf: 'string',
    department: 'ItemDepartment',
    description: 'string',
    category: 'ItemCategory',
  },
};

class ItemLine {}
ItemLine.schema = {
  name: 'ItemLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: 'Item',
    packSize: 'double',
    numberOfPacks: 'double',
    totalQuantity: 'double',  // Should be kept consistent with packSize x numberOfPacks
    expiryDate: 'date',
    batch: 'string',
    costPrice: 'double',
    sellPrice: 'double',
  },
};

class ItemDepartment {}
ItemDepartment.schema = {
  name: 'ItemDepartment',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    parentDepartment: 'ItemDepartment',
  },
};

class ItemCategory {}
ItemCategory.schema = {
  name: 'ItemCategory',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    parentCategory: 'ItemCategory',
  },
};

class Invoice {}
Invoice.schema = {
  name: 'Invoice',
  primaryKey: 'id',
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
    lines: { type: 'list', objectType: 'InvoiceLine' },
  },
};

class InvoiceCategory {}
InvoiceCategory.schema = {
  name: 'InvoiceCategory',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    parentCategory: 'InvoiceCategory',
  },
};

class InvoiceLine {}
InvoiceLine.schema = {
  name: 'InvoiceLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    itemLine: 'ItemLine',
    packSize: 'double',
    numberOfPacks: 'double',
    invoice: 'Invoice',
  },
};

class MasterList {}
MasterList.schema = {
  name: 'MasterList',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    description: 'string',
    lines: { type: 'list', objectType: 'MasterListLine' },
  },
};

class MasterListLine {}
MasterListLine.schema = {
  name: 'MasterListLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    masterList: 'MasterList',
    item: 'Item',
    imprestQuantity: 'double',
  },
};

class Name {}
Name.schema = {
  name: 'Name',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    code: 'string',
    phoneNumber: 'string',
    billingAddress: 'Address',
    type: 'string',
    masterList: 'MasterList',
    invoices: { type: 'list', objectType: 'Invoice' },
  },
};

class Requisition {}
Requisition.schema = {
  name: 'Requisition',
  primaryKey: 'id',
  properties: {
    id: 'string',
    status: 'string',
    entryDate: 'date',
    monthsToSupply: 'double',
    serialNumber: 'int',
    lines: { type: 'list', objectType: 'RequisitionLine' },
  },
};

class RequisitionLine {}
RequisitionLine.schema = {
  name: 'RequisitionLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    requisition: 'Requisition',
    item: 'Item',
    stockOnHand: 'double',
    monthlyUsage: 'double',
    suggestedQuantity: 'double',
    imprestQuantity: 'double',
    requiredQuantity: 'double',
    comment: 'string',
  },
};

class Setting {}
Setting.schema = {
  name: 'Setting',
  primaryKey: 'id',
  properties: {
    id: 'string',
    key: 'string',
    value: 'string',
    user: 'User',
  },
};

class Stocktake {}
Stocktake.schema = {
  name: 'Stocktake',
  primaryKey: 'id',
  properties: {
    id: 'string',
    createdDate: 'date', // Includes time
    stocktakeDate: 'date',
    status: 'string',
    createdBy: 'User',
    finalisedBy: 'User',
    comment: 'string',
    serialNumber: 'int',
  },
};

class StocktakeLine {}
StocktakeLine.schema = {
  name: 'StocktakeLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    stocktake: 'Stocktake',
    itemLine: 'ItemLine',
    snapshotQuantity: 'double',
    snapshotPacksize: 'double',
    countedQuantity: 'double',
  },
};

class SyncOut {}
SyncOut.schema = {
  name: 'SyncOut',
  primaryKey: 'id',
  properties: {
    id: 'string',
    recordType: 'string', // i.e. Table name
    recordId: 'string',
  },
};

class User {}
User.schema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'string',
    username: 'string',
    lastLogin: 'date',
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    password: 'string',
    salt: 'string',
  },
};

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
    Stocktake,
    StocktakeLine,
    SyncOut,
    User,
  ];

export default new Realm({ schema, schemaVersion: 2 });
