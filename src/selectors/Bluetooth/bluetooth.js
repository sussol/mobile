/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

export const selectSendingBlinkTo = ({ bluetooth }) => {
  const { blink } = bluetooth || {};
  const { sendingBlinkTo = '' } = blink || {};
  return sendingBlinkTo;
};

export const selectIsScanning = ({ bluetooth }) => {
  const { scan } = bluetooth || {};
  const { isScanning = false } = scan || {};
  return isScanning;
};

export const selectScannedSensors = ({ bluetooth }) => {
  const { scan } = bluetooth || {};
  const { scannedSensorAddresses = [] } = scan || {};
  return scannedSensorAddresses;
};

export const selectIsSyncingTemps = ({ bluetooth }) => {
  const { download } = bluetooth || {};
  const { isSyncingTemps = false } = download || {};
  return isSyncingTemps;
};

export const selectDownloadingLogsFrom = ({ bluetooth }) => {
  const { download } = bluetooth || {};
  const { downloadingLogsFrom } = download;
  return downloadingLogsFrom;
};

export const selectLastDownloadTime = ({ bluetooth }, macAddress) => {
  const { download } = bluetooth || {};
  const { lastDownloadTime } = download;
  return lastDownloadTime[macAddress] ? new Date(lastDownloadTime[macAddress]) : null;
};

export const selectLastDownloadFailed = ({ bluetooth }, macAddress) => {
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
