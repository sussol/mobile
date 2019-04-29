import { generateUUID } from 'react-native-database';

function toInt(byteArray, startPosition) {
  // TO DO negative temperatures (this is unsigned int conversion)
  return byteArray[startPosition] * 256 + byteArray[startPosition + 1];
}

function addRefreshSensor(sensorInfo, sensorData, database) {
  const sensors = database.objects('Sensor').filtered('macAddress == $0', sensorInfo.macAddress);
  database.write(() => {
    let id = generateUUID();
    // eslint-disable-next-line prefer-destructuring
    if (sensors.length > 0) id = sensors[0].id;
    database.update('Sensor', {
      id,
      ...sensorInfo,
      ...sensorData,
    });
  });
}

function parseSensorAdvertisment(advertismentData) {
  return {
    batteryLevel: advertismentData[8],
    temperature: toInt(advertismentData, 13) / 10.0,
    logInterval: toInt(advertismentData, 9),
    numberOfLogs: toInt(advertismentData, 11),
    lastConnectionTimestamp: new Date(),
  };
}

export function getFormatedPeriod(difference) {
  const seconds = difference / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  if (days > 1) return `${days.toFixed(0)} day/s`;
  if (hours > 1) return `${hours.toFixed(0)} hour/s`;
  if (minutes > 1) return `${minutes.toFixed(0)} minute/s`;
  if (seconds > 1) return `${seconds.toFixed(0)} second/s`;
  return 'now';
}

export function parseDownloadedData(downloadedData) {
  if (downloadedData.rawResultLines.length === 0) {
    return {
      failedParsing: true,
    };
  }
  const temperatureReadings = [];
  const { rawResultLines } = downloadedData;
  const totalNumberOfRecords = toInt(rawResultLines[0], 4);
  for (let i = 1; i < rawResultLines.length; i += 1) {
    const line = rawResultLines[i];
    for (let y = 0; y < line.length; y += 2) {
      const reading = toInt(line, y);
      if (reading === 11308) {
        return {
          temperatureReadings,
          totalNumberOfRecords,
        };
      }
      temperatureReadings.push(reading);
    }
  }
  return {
    failedParsing: true,
  };
}

export function updateSensors(sensors, database) {
  Object.entries(sensors).forEach(([address, { name, advertismentData }]) => {
    const sensorData = parseSensorAdvertisment(advertismentData);
    addRefreshSensor({ macAddress: address, name }, sensorData, database);
  });
}
