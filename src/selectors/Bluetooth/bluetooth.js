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
