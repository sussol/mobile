import { selectBluetoothState } from './index';

export const selectIsSyncingTemps = state => {
  const bluetooth = selectBluetoothState(state);
  const { download } = bluetooth || {};
  const { isSyncingTemps = false } = download || {};
  return isSyncingTemps;
};

export const selectDownloadingLogsFrom = state => {
  const bluetooth = selectBluetoothState(state);
  const { download } = bluetooth || {};
  const { downloadingLogsFrom } = download;
  return downloadingLogsFrom;
};

export const selectLastDownloadTime = (state, macAddress) => {
  const bluetooth = selectBluetoothState(state);
  const { download } = bluetooth || {};
  const { lastDownloadTime } = download;
  return lastDownloadTime[macAddress] ? new Date(lastDownloadTime[macAddress]) : null;
};

export const selectLastDownloadFailed = (state, macAddress) => {
  const bluetooth = selectBluetoothState(state);
  const { download } = bluetooth || {};
  const { lastDownloadStatus } = download;
  const status = lastDownloadStatus[macAddress];
  const lastDownloadFailed = status !== 'OK';
  return lastDownloadFailed;
};

export const selectIsDownloading = (state, macAddress) => {
  const downloadingLogsFrom = selectDownloadingLogsFrom(state);
  const isDownloading = downloadingLogsFrom === macAddress;

  return isDownloading;
};
