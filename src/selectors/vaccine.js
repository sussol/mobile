/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

export const selectScannedSensors = ({ vaccine }) => {
  const { scannedSensorAddresses = [] } = vaccine || {};
  return scannedSensorAddresses;
};

export const selectIsSyncingTemps = ({ vaccine }) => {
  const { isSyncingTemps = false } = vaccine || {};
  return isSyncingTemps;
};

export const selectIsScanning = ({ vaccine }) => {
  const { isScanning = false } = vaccine || {};
  return isScanning;
};

export const selectSendingBlinkTo = ({ vaccine }) => {
  const { sendingBlinkTo = '' } = vaccine || {};
  return sendingBlinkTo;
};
