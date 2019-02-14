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
export function sortDataBy(data, sortBy, sortDataType, isAscending = true) {
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
}

export default sortDataBy;
