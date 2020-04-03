/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const chunk = (array, size) => {
  if (!array || !size) return [];

  let i = 0;
  const tempArray = [];

  while (i < array.length) {
    tempArray.push(array.slice(i, i + size));
    i += size;
  }

  return tempArray;
};
