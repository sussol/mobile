/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

export const selectScannedSensors = ({ vaccine }) => {
  const { scannedSensorAddresses = [] } = vaccine || {};
  return scannedSensorAddresses;
};

export const selectIsScanning = ({ vaccine }) => {
  const { isScanning = false } = vaccine || {};
  return isScanning;
};
