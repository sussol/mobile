/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import moment from 'moment';

import { TEMPERATURE_SYNC_STATES } from '../reducers/TemperatureSyncReducer';
import { vaccineStrings, syncStrings } from '../localization';

const STATE_TO_MESSAGE = {
  [TEMPERATURE_SYNC_STATES.SCANNING]: syncStrings.scanning_for_sensors,
  [TEMPERATURE_SYNC_STATES.SCAN_ERROR]: syncStrings.error_scanning_for_sensors,
  [TEMPERATURE_SYNC_STATES.DOWNLOADING_LOGS]: syncStrings.downloading_temperature_logs,
  [TEMPERATURE_SYNC_STATES.DOWNLOADING_LOGS_ERROR]: syncStrings.error_downloading_temperature_logs,
  [TEMPERATURE_SYNC_STATES.RESETTING_ADVERTISEMENT_FREQUENCY]: syncStrings.resetting_sensor,
  [TEMPERATURE_SYNC_STATES.RESETTING_LOG_FREQUENCY]: syncStrings.resetting_sensor,
  [TEMPERATURE_SYNC_STATES.ERROR_RESETTING_ADVERTISEMENT_FREQUENCY]:
    syncStrings.error_resetting_sensor,
  [TEMPERATURE_SYNC_STATES.ERROR_RESETTING_LOG_FREQUENCY]: syncStrings.error_resetting_sensor,
  [TEMPERATURE_SYNC_STATES.SAVING_LOGS]: syncStrings.saving_temperature_logs,
  [TEMPERATURE_SYNC_STATES.NO_SENSORS]: syncStrings.no_sensors,
  [TEMPERATURE_SYNC_STATES.SYNCING]: syncStrings.syncing_temperatures,
  [TEMPERATURE_SYNC_STATES.BLUETOOTH_DISABLED]: syncStrings.bluetooth_disabled,
  [TEMPERATURE_SYNC_STATES.LOCATION_DISABLED]: syncStrings.location_permission,
};

export const selectTemperatureSyncMessage = ({ temperatureSync }) => {
  const { syncState, syncError } = temperatureSync;

  return STATE_TO_MESSAGE[syncState ?? syncError] ?? syncStrings.sync_complete;
};

export const selectTemperatureSyncLastSyncString = ({ temperatureSync }) => {
  const { lastTemperatureSync } = temperatureSync;
  const asMoment = moment(lastTemperatureSync);

  return `${asMoment.isValid() ? asMoment.format('H:mm MMMM D, YYYY ') : '--'}`;
};

export const selectCurrentSensorNameString = ({ temperatureSync }) => {
  const { currentSensorName } = temperatureSync;

  return currentSensorName ? `Syncing sensor: ${currentSensorName}` : null;
};

export const selectTemperatureSyncIsComplete = ({ temperatureSync }) => {
  const { total, progress } = temperatureSync;
  return total === progress;
};

export const selectTemperatureSyncStateMessage = ({ temperatureSync }) => {
  const { disabled, syncState, syncError } = temperatureSync;

  if (disabled) return `${syncStrings.sync_disabled}. `;
  if (syncError) return `${syncStrings.sync_error}.`;

  return syncState ? `${syncStrings.sync_in_progress}` : `${syncStrings.sync_enabled}.`;
};

export const selectTemperatureModalIsOpen = ({ temperatureSync }) => {
  const { modalIsOpen } = temperatureSync;

  return modalIsOpen;
};

export const selectTemperatureSyncProgress = ({ temperatureSync }) => {
  const { total, progress } = temperatureSync;

  return { total, progress };
};

export const selectIsSyncingTemperatures = ({ temperatureSync }) => {
  const { isSyncing } = temperatureSync;

  return isSyncing;
};

export const selectErrorMessage = ({ temperatureSync }) => {
  const { errorCode } = temperatureSync;

  return vaccineStrings[errorCode] ?? '';
};
