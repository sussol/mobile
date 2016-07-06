import uuid from 'uuid';

// Generate and return a universally unique ID based on RFC4122 v1
export function generateUUID() {
  return uuid.v1().replace(/-/g, ''); // Strip canonical uuid of hyphens
}

// Return the sum of the given key across the given lines
export function getTotal(lines, key) {
  return lines.reduce((sum, line) => sum + line[key], 0);
}

export function addLineToParent(line, parent, createAggregateItem) {
  let aggregateItem = parent.items.find(item => item.id === line.item.id);
  if (!aggregateItem) { // This parent doesn't have a matching item yet, make one
    aggregateItem = createAggregateItem();
    parent.items.push(aggregateItem);
  }
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
  const index = 0;

  // First apply as much of the quantity as possible to existing lines
  while (addQuantity !== 0 && index < lines.length) {
    const lineAddQuantity = lines[index].getAmountToAllocate(addQuantity);
    lines[index].totalQuantity += lineAddQuantity;
    addQuantity -= lineAddQuantity;
    if (saveLine) saveLine(lines[index]);
  }
  return addQuantity; // The remainder, not able to be allocated to the lines passed in
}
