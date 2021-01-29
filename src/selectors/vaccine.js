/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

export const selectIsDownloadingLogs = ({ vaccine }) => {
  const { isDownloadingLogs = false } = vaccine || {};
  return isDownloadingLogs;
};
