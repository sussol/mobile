const AddressSchema = {
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

const ItemSchema = {
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

const ItemCategorySchema = {
  name: 'ItemCategory',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    parentCategory: { type: 'ItemCategory', optional: true },
  },
};

const ItemDepartmentSchema = {
  name: 'ItemDepartment',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    parentDepartment: { type: 'ItemDepartment', optional: true },
  },
};

const ItemLineSchema = {
  name: 'ItemLine',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: { type: 'Item', optional: true },
    packSize: 'double',
    numberOfPacks: 'double',
    totalQuantity: 'double',  // Should be kept consistent with packSize x numberOfPacks
    expiryDate: 'date',
    batch: 'string',
    costPrice: 'double',
    sellPrice: 'double',
    supplier: { type: 'Name', optional: true },
  },
};

const MasterListSchema = {
  name: 'MasterList',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    note: { type: 'string', optional: true },
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
    imprestQuantity: { type: 'double', optional: true },
  },
};

const NameSchema = {
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
    masterList: { type: 'MasterList', optional: true },
    transactions: { type: 'list', objectType: 'Transaction' },
  },
};

const RequisitionSchema = {
  name: 'Requisition',
  primaryKey: 'id',
  properties: {
    id: 'string',
    status: 'string',
    type: 'string', // imprest or forecast
    entryDate: 'date',
    daysToSupply: 'double',
    serialNumber: 'string',
    user: { type: 'User', optional: true },
    lines: { type: 'list', objectType: 'RequisitionLine' },
  },
};

const RequisitionLineSchema = {
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

const SettingSchema = {
  name: 'Setting',
  primaryKey: 'key',
  properties: {
    key: 'string', // Includes the user's UUID if it is per-user
    value: 'string',
    user: { type: 'User', optional: true },
  },
};

const StocktakeSchema = {
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
    lines: { type: 'list', objectType: 'StocktakeLine' },
    additions: { type: 'Transaction', optional: true },
    reductions: { type: 'Transaction', optional: true },
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
    expiryDate: 'date',
    batch: 'string',
    costPrice: 'double',
    sellPrice: 'double',
    countedQuantity: { type: 'double', optional: true },
    sortIndex: { type: 'int', optional: true },
  },
};

const SyncOutSchema = {
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


const TransactionSchema = {
  name: 'Transaction',
  primaryKey: 'id',
  properties: {
    id: 'string',
    serialNumber: 'string',
    otherParty: { type: 'Name', optional: true },
    comment: 'string',
    entryDate: 'date',
    type: 'string',
    status: 'string',
    confirmDate: { type: 'date', optional: true },
    enteredBy: { type: 'User', optional: true },
    theirRef: 'string', // An external reference code
    category: { type: 'TransactionCategory', optional: true },
    lines: { type: 'list', objectType: 'TransactionLine' },
  },
};

const TransactionCategorySchema = {
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

const TransactionLineSchema = {
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
    totalQuantity: 'double',
    transaction: 'Transaction',
    note: { type: 'string', optional: true },
    costPrice: 'double',
    sellPrice: 'double',
    sortIndex: { type: 'int', optional: true },
  },
};

const UserSchema = {
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
      SettingSchema,
      SyncOutSchema,
      StocktakeSchema,
      StocktakeLineSchema,
      UserSchema,
    ],
    schemaVersion: 1,
  };
