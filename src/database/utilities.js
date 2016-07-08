import uuid from 'react-native-uuid';

// Generate and return a universally unique ID based on RFC4122 v1
export function generateUUID() {
  return uuid.v1().replace(/-/g, ''); // Strip canonical uuid of hyphens
}

// Return the sum of the given key across the given lines
export function getTotal(lines, key) {
  return lines.reduce((sum, line) => sum + line[key], 0);
}

export function addLineToParent(line, parent, createAggregateItem) {
  let aggregateItem = parent.items.find(item => item.id === line.itemId);
  if (!aggregateItem) { // This parent doesn't have a matching item yet, make one
    aggregateItem = createAggregateItem();
    parent.items.push(aggregateItem);
  }
  // If the line is already in the aggregateItem, we don't want to add it again
  if (aggregateItem.lines.find(currentLine => currentLine.id === line.id)) return;
  aggregateItem.lines.push(line);
}

/**
 * Applies the given difference to the shortest expiry batches possible.
 * @param {Realm.list} unsortedLines The lines to apply the difference to. Must be
 *                                   sortable by expiryDate and have a totalQuantity.
 * @param {double}     difference    The difference in quantity to set across all lines.
 *                                   Will be positive if greater new quantity, negative
 *                                   if lesser.
 * @param {function}   saveLine      Function to save the edited line in the database
 * @return {double}    remainder     The difference not able to be applied to the lines
 *                                   passed in.
 */
export function applyDifferenceToShortestBatch(unsortedLines, difference, saveLine) {
  let addQuantity = difference;
  const lines = unsortedLines.sorted('expiryDate');

  // First apply as much of the quantity as possible to existing lines
  for (let index = 0; addQuantity !== 0 && index < lines.length; index++) {
    const lineAddQuantity = lines[index].getAmountToAllocate(addQuantity);
    lines[index].totalQuantity += lineAddQuantity;
    addQuantity -= lineAddQuantity;
    if (saveLine) saveLine(lines[index]);
  }
  return addQuantity; // The remainder, not able to be allocated to the lines passed in
}
