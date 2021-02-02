/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

export const selectIsDownloadingLogs = ({ vaccine }) => {
  const { isDownloadingLogs = false } = vaccine || {};
  return isDownloadingLogs;
};

export const selectDownloadingLogsFrom = ({ vaccine }) => {
  const { downloadingLogsFrom } = vaccine;
  return downloadingLogsFrom;
};

export const selectLastDownloadTime = ({ vaccine }, macAddress) => {
  const { lastDownloadTime } = vaccine;
  return new Date(lastDownloadTime[macAddress] ?? 0);
};

export const selectLastDownloadFailed = ({ vaccine }, macAddress) => {
  const { lastDownloadStatus } = vaccine;
  const status = lastDownloadStatus[macAddress];
  const lastDownloadFailed = status === 'ERROR';
  return lastDownloadFailed;
};

export const selectIsDownloading = (state, macAddress) => {
  const downloadingLogsFrom = selectDownloadingLogsFrom(state);
  const isDownloading = downloadingLogsFrom === macAddress;

  return isDownloading;
};
