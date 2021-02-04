import { selectBluetoothState } from './index';

export const selectIsScanning = state => {
  const bluetooth = selectBluetoothState(state);
  const { scan } = bluetooth || {};
  const { isScanning = false } = scan || {};
  return isScanning;
};

export const selectScannedSensors = state => {
  const bluetooth = selectBluetoothState(state);
  const { scan } = bluetooth || {};
  const { scannedSensorAddresses = [] } = scan || {};
  return scannedSensorAddresses;
};
