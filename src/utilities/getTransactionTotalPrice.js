import { getPriceExtension } from './getPriceExtension';

export function getTransactionTotalPrice(transaction) {
  return transaction.lines.reduce((sum, line) => sum + getPriceExtension(line));
}
