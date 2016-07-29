/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

 /**
 * Sorts the given data according sortBy, sortDataType and isAscending.
 * @param  {Realm.results}  data          The data to sort.
 * @param  {string}         sortBy        The property of the data to sort by.
 * @param  {string}         sortDataType  The type of the property, either:
 *                                         'string' for alphabetical sorting (ASCII order for nums),
 *                                         'number' for numeric sorting (letters will error),
 *                                         'realm'  for default realm.results.sorted() sorting, this
 *                                                  is also the default sort (Will error on property
 *                                                  of a property).
 * @param  {boolean}        isAscending   If false, the sort order will be reversed.
 * @return {object}         sortedData    The final sorted data is returned.
 */
export function sortDataBy(data, sortBy, sortDataType, isAscending = true) {
  let sortedData;
  switch (sortDataType) {
    case 'string':
      sortedData = data.slice().sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
      if (!isAscending) sortedData.reverse();
      break;
    case 'number':
      // Casts to number to cover cases where the property is a string (serialNumber)
      sortedData = data.slice().sort((a, b) => Number(a[sortBy]) - Number(b[sortBy]));
      if (!isAscending) sortedData.reverse();
      break;
    case 'realm':
    default:
      sortedData = data.sorted(sortBy, !isAscending);
  }
  return sortedData;
}
