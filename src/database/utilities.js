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
  let aggregateItem = null;
  parent.items.forEach((item) => {
    if (item.item.id === line.item.id) aggregateItem = item;
  });
  if (!aggregateItem) { // This parent doesn't have a matching item yet, make one
    aggregateItem = createAggregateItem();
    parent.items.push(aggregateItem);
  }
  aggregateItem.lines.push(line);
}
