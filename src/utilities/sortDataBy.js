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

/**
 * Sorts an array of objects, returning a new array.
 * Sorts strings, numbers, dates or booleans.
 * Types: 'string', 'number', 'date', 'boolean'.
 * @param {Array}   data          Array of objects to sort
 * @param {String}  sortBy        Key for the field to sort by
 * @param {String}  sortDataType  The type of data to sort
 * @param {Boolean} isAscending   True if ascending, false otherwise.
 */
export const newSortDataBy = (data, sortBy, sortDataType, isAscending = true) => {
  switch (sortDataType) {
    case 'string':
      if (isAscending) return [...data.sort((a, b) => b[sortBy].localeCompare(a[sortBy]))];
      return [...data.sort((a, b) => a[sortBy].localeCompare(b[sortBy]))];
    case 'number':
      // Casts to number to cover cases where the property is a string (e.g. |serialNumber|).
      if (isAscending) return [...data.sort((a, b) => Number(a[sortBy]) - Number(b[sortBy]))];
      return [...data.sort((a, b) => Number(b[sortBy]) - Number(a[sortBy]))];
    case 'date':
      if (isAscending) return [...data.sort((a, b) => new Date(b[sortBy]) - new Date(a[sortBy]))];
      return [...data.sort((a, b) => new Date(a[sortBy]) - new Date(b[sortBy]))];
    case 'boolean':
      if (isAscending) return [...data.sort((a, b) => b[sortBy] - a[sortBy])];
      return [...data.sort((a, b) => a[sortBy] - b[sortBy])];
    default:
      return [...data];
  }
};

export default sortDataBy;
