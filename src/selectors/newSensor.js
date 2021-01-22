export const selectNewSensor = ({ newSensor }) => {
  const { macAddress = '' } = newSensor || {};
  return macAddress;
};
