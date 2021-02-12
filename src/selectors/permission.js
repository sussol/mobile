/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

const selectLocationPermission = ({ permission }) => {
  const { location } = permission;

  return location;
};

const selectLocationService = ({ permission }) => {
  const { locationService } = permission;

  return locationService;
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
  locationService: selectLocationService,
  writeStorage: selectWriteStoragePermission,
  bluetooth: selectBluetoothEnabled,
};
