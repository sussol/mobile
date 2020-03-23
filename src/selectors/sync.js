/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const selectIsSyncing = ({ sync }) => {
  const { isSyncing } = sync;
  return isSyncing ?? false;
};
