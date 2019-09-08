/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

/**
 * Sorts data by property.
 *
 * @param  {Realm.results}  data          The data to sort.
 * @param  {string}         sortBy        The property of the data to sort by.
 * @param  {string}         sortDataType  The type of the property, either:
 *
 *                                        'string' for alphabetical sorting (ASCII order for nums),
 *                                        'number' for numeric sorting (letters will error),
 *                                        'realm'  for default |realm.results.sorted()| sorting,
 *                                                 this is also the default sort (will error on
 *                                                 property of a property).
 *
 * @param   {boolean}        isAscending  If false, the sort order will be reversed.
 * @return  {object}                      The final sorted data.
 */
export const sortDataBy = (data, sortBy, sortDataType, isAscending = true) => {
  let sortedData;
  switch (sortDataType) {
    case 'string':
      sortedData = data.slice().sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
      if (!isAscending) sortedData.reverse();
      break;
    case 'number':
      // Casts to number to cover cases where the property is a string (e.g. |serialNumber|).
      sortedData = data.slice().sort((a, b) => Number(a[sortBy]) - Number(b[sortBy]));
      if (!isAscending) sortedData.reverse();
      break;
    case 'realm':
    default:
      sortedData = data.sorted(sortBy, !isAscending);
  }
  return sortedData;
};

const sortKeyToType = {
  itemCode: 'string',
  itemName: 'string',
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
};

/**
 * Sorts an array of objects, returning a new array.
 * Sorts strings, numbers, dates or booleans.
 * @param  {Array}   data          Array of objects to sort
 * @param  {String}  sortKey       Key for the field to sort by
 * @param  {Boolean} isAscending   True if ascending, false otherwise.
 * @return {Array}   A new array of sorted data
 */
export const newSortDataBy = (data, sortKey, isAscending = true, sortDataType) => {
  const sortType = sortDataType || sortKeyToType[sortKey];

  switch (sortType) {
    case 'string':
      if (isAscending) return [...data.sort((a, b) => a[sortKey].localeCompare(b[sortKey]))];
      return [...data.sort((a, b) => b[sortKey].localeCompare(a[sortKey]))];
    case 'number':
      // Casts to number to cover cases where the property is a string (e.g. |serialNumber|).
      if (isAscending) return [...data.sort((a, b) => Number(a[sortKey]) - Number(b[sortKey]))];
      return [...data.sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]))];
    case 'date':
      if (isAscending) return [...data.sort((a, b) => new Date(b[sortKey]) - new Date(a[sortKey]))];
      return [...data.sort((a, b) => new Date(a[sortKey]) - new Date(b[sortKey]))];
    case 'boolean':
      if (isAscending) return [...data.sort((a, b) => b[sortKey] - a[sortKey])];
      return [...data.sort((a, b) => a[sortKey] - b[sortKey])];
    default:
      throw new Error(`sortType for the field '${sortKey}' not defined`);
  }
};

export default sortDataBy;
