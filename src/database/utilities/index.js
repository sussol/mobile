/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export {
  createRecord,
  getNextNumber,
  getNumberSequence,
  reuseNumber,
  NUMBER_SEQUENCE_KEYS,
} from './createRecord';
export { deleteRecord } from './deleteRecord';
// eslint-disable-next-line import/no-cycle
export { mergeRecords } from './mergeRecords';

// eslint-disable-next-line import/no-cycle
export { getTotal, addBatchToParent, millisecondsToDays } from './utilities';

export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
