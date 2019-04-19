import { formattedDifferenceBetweenDates, formatExposureRange } from '../formatters';

/**
 * Method for creating data for BreachTable rows.
 * Accepts an array (Example below) of objects,
 * each having a breach property which contains
 * a realm results of sensorLog objects.
 * @param {Array} data Example below
 * [ {
 *     breach: [ sensorLogs ],
 *     ...
 *   },
 *    ...
 * ]
 */
export const setBreachData = (data = []) => {
  const dataCopy = [];
  data.forEach(dataSet => {
    const { breach } = dataSet;
    // A breach must have a minimum of 3 sensorlogs to be considered
    // a breach.
    if (!breach || breach.length < 4) return;
    const [firstSensorLog = null, , { timestamp: lastTimestamp } = {}] = breach;
    // If there is no first or last sensor logs, or if either does not have a timestamp,
    // don't create data for this breach.
    if (!(firstSensorLog && firstSensorLog.timestamp && lastTimestamp)) return;
    dataCopy.push({
      ...dataSet,
      breachData: {
        affectedQuantity: firstSensorLog.sum('itemBatches.numberOfPacks'),
        location: (firstSensorLog.location && firstSensorLog.location.description) || 'Unavailable',
        duration: formattedDifferenceBetweenDates(firstSensorLog.timestamp, lastTimestamp),
        exposureRange: formatExposureRange(breach.min('temperature'), breach.max('temperature')),
        numberOfAffectedBatches: firstSensorLog.itemBatches.length,
      },
    });
  });
  return dataCopy;
};

export default setBreachData;
