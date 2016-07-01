import {
  Address,
  Item,
  ItemLine,
  ItemDepartment,
  ItemCategory,
  Transaction,
  TransactionItem,
  TransactionCategory,
  TransactionLine,
  MasterList,
  MasterListLine,
  Name,
  Requisition,
  RequisitionItem,
  RequisitionLine,
  Setting,
  SyncOut,
  Stocktake,
  StocktakeItem,
  StocktakeLine,
  User,
} from './DataTypes';

Address.schema = {
  name: 'Address',
  primaryKey: 'id',
  properties: {
    id: 'string',
    line1: { type: 'string', optional: true },
    line2: { type: 'string', optional: true },
    line3: { type: 'string', optional: true },
    line4: { type: 'string', optional: true },
    zipCode: { type: 'string', optional: true },
  },
};

Item.schema = {
  name: 'Item',
  primaryKey: 'id',
  properties: {
    id: 'string',
    code: 'string',
    name: 'string',
    defaultPackSize: 'double',
    lines: { type: 'list', objectType: 'ItemLine' },
    department: { type: 'ItemDepartment', optional: true },
    description: { type: 'string', optional: true },
    category: { type: 'ItemCategory', optional: true },
    defaultPrice: { type: 'double', optional: true },
  },
};

ItemCategory.schema = {
  name: 'ItemCategory',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    parentCategory: { type: 'ItemCategory', optional: true },
  },
};

ItemDepartment.schema = {
  name: 'ItemDepartment',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    parentDepartment: { type: 'ItemDepartment', optional: true },
  },
};

ItemLine.schema = {
  name: 'ItemLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: { type: 'Item', optional: true },
    packSize: 'double',
    numberOfPacks: 'double',
    expiryDate: 'date',
    batch: 'string',
    costPrice: 'double',
    sellPrice: 'double',
    supplier: { type: 'Name', optional: true },
  },
};

MasterList.schema = {
  name: 'MasterList',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    note: { type: 'string', optional: true },
    lines: { type: 'list', objectType: 'MasterListLine' },
  },
};

MasterListLine.schema = {
  name: 'MasterListLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    masterList: 'MasterList',
    item: 'Item',
    imprestQuantity: { type: 'double', optional: true },
  },
};

Name.schema = {
  name: 'Name',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    code: 'string',
    phoneNumber: { type: 'string', optional: true },
    billingAddress: { type: 'Address', optional: true },
    emailAddress: { type: 'string', optional: true },
    type: 'string',
    useMasterList: 'boolean',
    masterList: { type: 'MasterList', optional: true },
    transactions: { type: 'list', objectType: 'Transaction' },
  },
};

Requisition.schema = {
  name: 'Requisition',
  primaryKey: 'id',
  properties: {
    id: 'string',
    status: 'string',
    type: 'string', // imprest, forecast or request (request only used in mobile)
    entryDate: 'date',
    daysToSupply: 'double',
    serialNumber: 'string',
    user: { type: 'User', optional: true },
    items: { type: 'list', objectType: 'RequisitionItem' },
  },
};

RequisitionItem.schema = {
  name: 'RequisitionItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: 'Item',
    requisition: 'Requisition',
    lines: { type: 'list', objectType: 'RequisitionLine' },
  },
};

RequisitionLine.schema = {
  name: 'RequisitionLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    requisition: { type: 'Requisition', optional: true },
    item: { type: 'Item', optional: true },
    stockOnHand: 'double',
    dailyUsage: { type: 'double', optional: true },
    suggestedQuantity: 'double',
    imprestQuantity: { type: 'double', optional: true },
    requiredQuantity: { type: 'double', optional: true },
    comment: { type: 'string', optional: true },
    sortIndex: { type: 'int', optional: true },
  },
};

Setting.schema = {
  name: 'Setting',
  primaryKey: 'key',
  properties: {
    key: 'string', // Includes the user's UUID if it is per-user
    value: 'string',
    user: { type: 'User', optional: true },
  },
};

Stocktake.schema = {
  name: 'Stocktake',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    createdDate: 'date', // Includes time
    stocktakeDate: { type: 'date', optional: true },
    status: 'string',
    createdBy: { type: 'User', optional: true },
    finalisedBy: { type: 'User', optional: true },
    comment: { type: 'string', optional: true },
    serialNumber: 'string',
    items: { type: 'list', objectType: 'StocktakeItem' },
    additions: { type: 'Transaction', optional: true },
    reductions: { type: 'Transaction', optional: true },
  },
};

StocktakeItem.schema = {
  name: 'StocktakeItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: 'Item',
    stocktake: 'Stocktake',
    lines: { type: 'list', objectType: 'StocktakeLine' },
  },
};

StocktakeLine.schema = {
  name: 'StocktakeLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    stocktake: 'Stocktake',
    itemLine: 'ItemLine',
    snapshotNumberOfPacks: 'double',
    packSize: 'double',
    expiryDate: 'date',
    batch: 'string',
    costPrice: 'double',
    sellPrice: 'double',
    countedNumberOfPacks: { type: 'double', optional: true },
    sortIndex: { type: 'int', optional: true },
  },
};

SyncOut.schema = {
  name: 'SyncOut',
  primaryKey: 'id',
  properties: {
    id: 'string',
    changeTime: 'int', // In seconds since the epoch
    changeType: 'string', // create, update, or delete
    recordType: 'string', // i.e. Table name
    recordId: 'string',
  },
};


Transaction.schema = {
  name: 'Transaction',
  primaryKey: 'id',
  properties: {
    id: 'string',
    serialNumber: 'string',
    otherParty: { type: 'Name', optional: true },
    comment: { type: 'string', optional: true },
    entryDate: 'date',
    type: 'string',
    status: 'string',
    confirmDate: { type: 'date', optional: true },
    enteredBy: { type: 'User', optional: true },
    theirRef: { type: 'string', optional: true }, // An external reference code
    category: { type: 'TransactionCategory', optional: true },
    items: { type: 'list', objectType: 'TransactionItem' },
  },
};

TransactionCategory.schema = {
  name: 'TransactionCategory',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    code: 'string',
    type: 'string',
    parentCategory: { type: 'TransactionCategory', optional: true },
  },
};

TransactionItem.schema = {
  name: 'TransactionItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: 'Item',
    transaction: 'Transaction',
    lines: { type: 'list', objectType: 'TransactionLine' },
  },
};

TransactionLine.schema = {
  name: 'TransactionLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    itemId: 'string',
    itemName: 'string',
    itemLine: 'ItemLine',
    batch: 'string',
    expiryDate: 'date',
    packSize: 'double',
    numberOfPacks: 'double',
    numberOfPacksSent: { type: 'double', optional: true }, // For supplier invoices
    transaction: 'Transaction',
    note: { type: 'string', optional: true },
    costPrice: 'double',
    sellPrice: 'double',
    sortIndex: { type: 'int', optional: true },
  },
};

User.schema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'string',
    username: 'string',
    lastLogin: { type: 'date', optional: true },
    firstName: { type: 'string', optional: true },
    lastName: { type: 'string', optional: true },
    email: { type: 'string', optional: true },
    passwordHash: 'string',
    salt: { type: 'string', optional: true },
  },
};

export const schema =
  {
    schema: [
      Address,
      Item,
      ItemLine,
      ItemDepartment,
      ItemCategory,
      Transaction,
      TransactionItem,
      TransactionLine,
      TransactionCategory,
      MasterList,
      MasterListLine,
      Name,
      Requisition,
      RequisitionItem,
      RequisitionLine,
      Setting,
      SyncOut,
      Stocktake,
      StocktakeItem,
      StocktakeLine,
      User,
    ],
    schemaVersion: 1,
  };
