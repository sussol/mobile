import { getPriceExtension } from './getPriceExtension';

export function getTransactionTotalPrice(transaction) {
  if (!transaction.lines || transaction.lines.length === 0) return 0;
  return transaction.lines.reduce((sum, line) => sum + getPriceExtension(line));
}
