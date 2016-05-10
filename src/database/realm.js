import Realm from 'realm';

const AddressSchema = {
  name: 'Address',
  primaryKey: 'id',
  properties: {
    id: 'string',
    line1: 'string',
    line2: 'string',
    line3: 'string',
  },
};

const ItemSchema = {
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

const ItemLineSchema = {
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

const ItemDepartmentSchema = {
  name: 'ItemDepartment',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    parentDepartment: 'ItemDepartment',
  },
};

const ItemCategorySchema = {
  name: 'ItemCategory',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    parentCategory: 'ItemCategory',
  },
};

const TransactionSchema = {
  name: 'Transaction',
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
    category: 'TransactionCategory',
    lines: { type: 'list', objectType: 'TransactionLine' },
  },
};

const TransactionCategorySchema = {
  name: 'TransactionCategory',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    parentCategory: 'TransactionCategory',
  },
};

const TransactionLineSchema = {
  name: 'TransactionLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    itemLine: 'ItemLine',
    packSize: 'double',
    numberOfPacks: 'double',
    invoice: 'Transaction',
  },
};

const MasterListSchema = {
  name: 'MasterList',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    description: 'string',
    lines: { type: 'list', objectType: 'MasterListLine' },
  },
};

const MasterListLineSchema = {
  name: 'MasterListLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    masterList: 'MasterList',
    item: 'Item',
    imprestQuantity: 'double',
  },
};

const NameSchema = {
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
    invoices: { type: 'list', objectType: 'Transaction' },
  },
};

const RequisitionSchema = {
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

const RequisitionLineSchema = {
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

const SyncOutSchema = {
  name: 'SyncOut',
  primaryKey: 'id',
  properties: {
    id: 'string',
    recordType: 'string', // i.e. Table name
    recordId: 'string',
  },
};

const StocktakeSchema = {
  name: 'Stocktake',
  primaryKey: 'id',
  properties: {
    id: 'string',
    createdDate: 'date', // Includes time
    stocktakeDate: 'date',
    status: 'string',
    created_by: 'User',
    finalised_by: 'User',
    comment: 'string',
    serialNumber: 'int',
  },
};

const StocktakeLineSchema = {
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

const UserSchema = {
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
    AddressSchema,
    ItemSchema,
    ItemLineSchema,
    ItemDepartmentSchema,
    ItemCategorySchema,
    TransactionSchema,
    TransactionLineSchema,
    TransactionCategorySchema,
    MasterListSchema,
    MasterListLineSchema,
    NameSchema,
    RequisitionSchema,
    RequisitionLineSchema,
    SyncOutSchema,
    StocktakeSchema,
    StocktakeLineSchema,
    UserSchema,
  ];

export default new Realm({ schema: schema, schemaVersion: 3 });
