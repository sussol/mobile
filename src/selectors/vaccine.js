/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

export const selectScannedAddresses = ({ vaccine }) => {
  const { sensors = [] } = vaccine || {};
  return sensors.map(s => s.macAddress);
};

export const selectIsScanning = ({ vaccine }) => {
  const { isScanning = false } = vaccine || {};
  return isScanning;
};

export const selectIsBlinking = ({ vaccine }, macAddress) => {
  const { sensors = [] } = vaccine || {};
  const sensor = sensors.find(s => s.macAddress === macAddress);
  return sensor?.isBlinking;
};
