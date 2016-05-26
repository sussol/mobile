export function getPriceExtension(transactionLine) {
  if (transactionLine.transaction.type === 'customer_invoice') {
    return transactionLine.sellPrice * transactionLine.numberOfPacks;
  }
  // Must be a supplier invoice
  return transactionLine.costPrice * transactionLine.numberOfPacks;
}
