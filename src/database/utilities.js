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
