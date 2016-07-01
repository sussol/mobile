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
 */
export function applyDifferenceToShortestBatch(unsortedLines, difference) {
  let addQuantity = difference;
  const lines = unsortedLines.sorted('expiryDate');
  const index = 0;
  while (addQuantity !== 0 && index < lines.length) {
    const lineAddQuantity = addQuantity > 0 ?
                              addQuantity :
                              Math.min(addQuantity, -lines[index].totalQuantity);
    lines[index].totalQuantity = lines[index].totalQuantity + lineAddQuantity;
    addQuantity = addQuantity - lineAddQuantity;
  }
}
