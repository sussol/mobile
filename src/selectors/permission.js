/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

const selectLocationPermission = ({ permission }) => {
  const { location } = permission;

  return location;
};

const selectWriteStoragePermission = ({ permission }) => {
  const { writeStorage } = permission;

  return writeStorage;
};

const selectBluetoothEnabled = ({ permission }) => {
  const { bluetooth } = permission;

  return bluetooth;
};

export const PermissionSelectors = {
  location: selectLocationPermission,
  writeStorage: selectWriteStoragePermission,
  bluetooth: selectBluetoothEnabled,
};
