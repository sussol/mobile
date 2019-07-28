import { preAggregateLogs, doFullAggregation } from './aggregation';
import { createSensorLogs } from './utilities';
import { applyBreaches, addHeadAndTrailingLogToBreach } from './temperatureSensorHelpers';

/* eslint-disable import/prefer-default-export */
const FIND_SENSOR = 'Searching for sensor';
const NO_SENSOR = 'Cannot find sensor in proximity';
const SYNCING_LOGS = 'Syncing logs:';

const updateMessageSyncState = ({ message, lastSync, total = 100, progress = 100 }) => {
  // eslint-disable-next-line react/destructuring-assignment, prefer-destructuring
  if (!lastSync) lastSync = this.state.temperatureSyncState.lastSync;
  this.setState({
    temperatureSyncState: {
      ...this.state.temperatureSyncState, // eslint-disable-line react/no-access-state-in-setstate, react/destructuring-assignment, max-len
      message,
      lastSync,
      isSyncing: progress < 100,
      total,
      progress,
    },
  });
};

const syncSensor = async ({ database, sensor, updateMessage }) => {
  const params = { sensor, database };
  let result = null;
  // Update the initial message and progress
  updateMessage({ message: FIND_SENSOR, progress: 0 });
  // Scan and update the sensor - number of logs to download etc.
  result = await sensor.scanAndUpdate({ database, manufacturerId: 307 });
  if (!result) {
    updateMessage({ message: NO_SENSOR });
    return;
  }

  // Update with the number of logs to download
  updateMessage({
    message: `${SYNCING_LOGS} ${sensor.numberOfLogs}`,
    progress: 10,
  });
  // Download from the sensor all logs waiting
  result = await sensor.downloadLogs({ manufacturerId: 307 });
  console.log(result);

  if (!result.success) {
    updateMessage({ message: 'Failed to sync temperature data' });
    return;
  }

  updateMessage({
    message: `Creating Logs: ${sensor.numberOfLogs}`,
    progress: 25,
  });

  // Aggregation
  // const lastSync = database.objects('SensorLog').max('timestamp');

  result = await createSensorLogs({ database, sensor, parsedLogs: result.data[0].logs });

  updateMessage({ message: 'Pre aggregating Logs', progress: 40 });
  result = await preAggregateLogs(params);
  console.log(result);

  if (!result.success) {
    updateMessage({
      message: 'Temperature sync successfull, but failure during aggregation',
      progress: 45,
    });
    return;
  }

  updateMessage({ message: 'Searching for breaches', progress: 50 });
  result = await applyBreaches(params);
  console.log(result);
  if (!result.success) {
    updateMessage({
      message: 'Temperature sync successfull, but failed to search for breaches',
    });
    return;
  }

  result = await addHeadAndTrailingLogToBreach(params);
  console.log(result);
  if (!result.success) {
    updateMessage({
      message: 'Temperature sync successfull, but failed to search for breaches',
    });
    return;
  }

  updateMessage({ message: 'Finalising aggregation', progress: 55 });
  result = await doFullAggregation(params);
  console.log(result);
  // Reconfiguring sensor

  if (!result.success) {
    updateMessage({
      message: 'Temperature sync successfull, but failed finalise aggregation',
    });
    return;
  }

  updateMessage({ message: 'Resetting Sensor', progress: 80 });
  result = await sensor.sendReset(307);
  console.log(result);

  if (!result.success) {
    updateMessage({ message: 'Sync successfull, but failed to reset sensor' });
    return;
  }

  // updateMessageSyncState({ message: 'Reconfiguring sensor', progress: 80 });
  // console.log(result);
  // result = await sensorSyncMethods.resetSensorAdvertismentFrequency(params);
  // if (!result.success) {
  //   updateMessageSyncState({
  //     message: 'Temperature sync successfull, but failed to reconfigure sensor',
  //   });
  //   return;
  // }
  updateMessageSyncState({ message: 'Full temperature sync successfull' });
};

export const synchroniseSensors = async ({ database, updateMessage }) => {
  const linkedSensors = database.objects('Sensor').filtered('location != null');
  for (let i = 0; i < linkedSensors.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const result = await syncSensor({ sensor: linkedSensors[i], database, updateMessage });
    console.log(result);
  }
};
