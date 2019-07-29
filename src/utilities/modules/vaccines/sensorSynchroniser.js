import { preAggregateLogs, doFullAggregation } from './aggregation';
import { createSensorLogs, createBreaches } from './utilities';

export const syncSensor = async ({ database, sensor, updateMessage }) => {
  updateMessage({ message: 'Searching for sensor', progress: 0 });
  const downloadedLogs = await sensor.downloadLogs();

  if (!(downloadedLogs && downloadedLogs.success)) {
    updateMessage({ message: 'Failed to sync temperature data' });
    return;
  }

  database.write(() => {
    database.update('Sensor', {
      id: sensor.id,
      lastConnectionTimestamp: new Date(),
      ...downloadedLogs.data[0],
    });
  });

  updateMessage({
    message: `Creating Logs: ${sensor.numberOfLogs}`,
    progress: 25,
  });

  const createResult = await createSensorLogs({
    database,
    sensor,
    parsedLogs: downloadedLogs.data[0].logs,
  });

  if (!(createResult && createResult.success)) {
    updateMessage({
      message: 'Failed creating sensor logs',
      progress: 45,
    });
  }

  updateMessage({ message: 'Pre aggregating Logs', progress: 40 });

  const preAggregateResult = await preAggregateLogs({ sensor, database });

  if (!(preAggregateResult && preAggregateResult.success)) {
    updateMessage({
      message: 'Temperature sync successfull, but failure during aggregation',
      progress: 45,
    });
    return;
  }

  updateMessage({ message: 'Searching for breaches', progress: 50 });
  const breachesResult = await createBreaches({ sensor, database });
  if (!breachesResult.success) {
    updateMessage({
      message: 'Temperature sync successfull, but failed to search for breaches',
    });
    return;
  }

  updateMessage({ message: 'Finalising aggregation', progress: 55 });
  const fullAggregationResult = await doFullAggregation({ database, sensor });

  if (!fullAggregationResult.success) {
    updateMessage({
      message: 'Temperature sync successfull, but failed finalise aggregation',
    });
    return;
  }

  // Reconfiguring sensor
  updateMessage({ message: 'Resetting Sensor', progress: 80 });
  const resetResult = await sensor.sendReset();

  if (!resetResult.success) {
    updateMessage({ message: 'Sync successfull, but failed to reset sensor' });
    return;
  }

  updateMessage({ message: 'Full temperature sync successfull' });
};

export const synchroniseSensors = async ({ database, updateMessage }) => {
  const linkedSensors = database.objects('Sensor').filtered('location != null');
  for (let i = 0; i < linkedSensors.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const result = await syncSensor({ sensor: linkedSensors[i], database, updateMessage });
    console.log(result);
  }
};
