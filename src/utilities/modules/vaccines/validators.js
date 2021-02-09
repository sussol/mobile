export const isValidMacAddress = macAddress =>
  /^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/.test(macAddress);
