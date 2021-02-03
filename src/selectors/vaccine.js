/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */
import { syncStrings } from '../localization';

export const selectTemperatureSyncMessage = ({ vaccine }) => {
  const { isSyncingTemps = false, error } = vaccine;
  if (isSyncingTemps) {
    return syncStrings.downloading_temperature_logs;
  }

  if (error) {
    return `${syncStrings.error_downloading_temperature_logs} ${error}`;
  }

  return syncStrings.sync_complete;
};

export const selectIsSyncingTemps = ({ vaccine }) => {
  const { isSyncingTemps = false } = vaccine || {};
  return isSyncingTemps;
};
