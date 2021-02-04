/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */
import { syncStrings } from '../localization';

export const selectTemperatureSyncMessage = ({ vaccine }) => {
  const { isSyncingTemps = false, error } = vaccine;
  if (isSyncingTemps) {
    return syncStrings.downloading_temperature_logs;
  }

  if (error) {
    return `${syncStrings.error_downloading_temperature_logs} ${error}`;
  }

  return syncStrings.sync_complete;
};

export const selectIsSyncingTemps = ({ vaccine }) => {
  const { isSyncingTemps = false } = vaccine || {};
  return isSyncingTemps;
};

export const selectDownloadingLogsFrom = ({ vaccine }) => {
  const { downloadingLogsFrom } = vaccine;
  return downloadingLogsFrom;
};

export const selectLastDownloadTime = ({ vaccine }, macAddress) => {
  const { lastDownloadTime } = vaccine;
  return lastDownloadTime[macAddress] ? new Date(lastDownloadTime[macAddress]) : null;
};

export const selectLastDownloadFailed = ({ vaccine }, macAddress) => {
  const { lastDownloadStatus } = vaccine;
  const status = lastDownloadStatus[macAddress];
  const lastDownloadFailed = status !== 'OK';
  return lastDownloadFailed;
};

export const selectIsDownloading = (state, macAddress) => {
  const downloadingLogsFrom = selectDownloadingLogsFrom(state);
  const isDownloading = downloadingLogsFrom === macAddress;

  return isDownloading;
};
