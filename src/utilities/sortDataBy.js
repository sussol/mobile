/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

const sortKeyToType = {
  itemCode: 'string',
  itemName: 'string',
  dateOfBirth: 'date',
  availableQuantity: 'number',
  totalQuantity: 'number',
  expiryDate: 'date',
  serialNumber: 'number',
  numberOfItems: 'number',
  status: 'string',
  entryDate: 'date',
  otherPartyName: 'string',
  ourStockOnHand: 'number',
  monthlyUsage: 'number',
  suggestedQuantity: 'number',
  requiredQuantity: 'number',
  createdDate: 'date',
  name: 'string',
  code: 'string',
  snapshotTotalQuantity: 'number',
  countedTotalQuantity: 'number',
  difference: 'number',
  stockOnHand: 'number',
  suppliedQuantity: 'number',
  firstName: 'string',
  lastName: 'string',
  registrationCode: 'string',
  invoiceNumber: 'number',
  returnAmount: 'number',
  total: 'number',
  reasonTitle: 'string',
  confirmDate: 'date',
};

/**
 * Sorts an array of objects, returning a new array.
 * Sorts strings, numbers, dates or booleans.
 * @param  {Array}   data          Array of objects to sort
 * @param  {String}  sortKey       Key for the field to sort by
 * @param  {Boolean} isAscending   True if ascending, false otherwise.
 * @return {Array}   A new array of sorted data
 */
export const sortDataBy = (data, sortKey, isAscending = true, sortDataType) => {
  const sortType = sortDataType || sortKeyToType[sortKey];

  switch (sortType) {
    case 'string':
      if (isAscending) return [...data.sort((a, b) => a[sortKey]?.localeCompare(b[sortKey]))];
      return [...data.sort((a, b) => b[sortKey]?.localeCompare(a[sortKey]))];
    case 'number':
      // Casts to number to cover cases where the property is a string (e.g. |serialNumber|).
      if (isAscending) return [...data.sort((a, b) => Number(a[sortKey]) - Number(b[sortKey]))];
      return [...data.sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]))];
    case 'date':
      if (isAscending) return [...data.sort((a, b) => new Date(a[sortKey]) - new Date(b[sortKey]))];
      return [...data.sort((a, b) => new Date(b[sortKey]) - new Date(a[sortKey]))];
    case 'boolean':
      if (isAscending) return [...data.sort((a, b) => a[sortKey] - b[sortKey])];
      return [...data.sort((a, b) => b[sortKey] - a[sortKey])];
    default:
      throw new Error(`sortType for the field '${sortKey}' not defined`);
  }
};

export default sortDataBy;
