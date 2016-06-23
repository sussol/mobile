export function getPriceExtension(transactionLine, type) {
  if (!transactionLine.numberOfPacks) return 0;
  if (type === 'customer_invoice') {
    if (!transactionLine.sellPrice) return 0;
    return transactionLine.sellPrice * transactionLine.numberOfPacks;
  }
  // Must be a supplier invoice
  if (!transactionLine.costPrice) return 0;
  return transactionLine.costPrice * transactionLine.numberOfPacks;
}
