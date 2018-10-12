import { generateUUID } from 'react-native-database';

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
  for (let i = 1; i < rawResultLines.length; i++) {
    const line = rawResultLines[i];
    for (let y = 0; y < line.length; y += 2) {
      const reading = this.toInt(line, y);
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

export function calculateNewLogs(data) {
  const returnData = { returnMessage: '', logsToAdd: [] };
  const {
    sensor,
    logCounter,
    temperatureReadings,
    currentDate,
    totalNumberOfRecords: lastSensorLog,
  } = data;

  const { logInterval } = sensor;
  const numberOfReadings = temperatureReadings.length;

  let readingsStartDate = new Date(currentDate);
  readingsStartDate.setSeconds(
    readingsStartDate.getSeconds() - logInterval * (numberOfReadings - 1),
  );

  let startOfReading = 0;
  let startOfLogCounter = 0;

  if (typeof lastSensorLog === 'undefined' || lastSensorLog === null || lastSensorLog === false) {
    returnData.returnMessage += 'no previous logs\n';

    startOfLogCounter = logCounter - numberOfReadings;

    returnData.logsToAdd = this.generateLogs(
      readingsStartDate,
      startOfReading,
      startOfLogCounter,
      logInterval,
      temperatureReadings,
    );
    return returnData;
  }

  const {
    logInterval: lastLogInterval,
    logCounter: lastLogCounter,
    timestamp: lastTimestamp,
  } = lastSensorLog;

  if (logInterval !== lastLogInterval) {
    returnData.returnMessage += 'log interval changed\n';
    if (lastTimestamp >= readingsStartDate) {
      const secondsDifference = (currentDate - lastTimestamp) / 1000;
      const numberOfLogsToIntegrate = Math.floor(secondsDifference / logInterval);
      startOfReading = numberOfReadings - numberOfLogsToIntegrate;
      startOfLogCounter = logCounter - numberOfLogsToIntegrate;
      readingsStartDate = new Date(currentDate);
      readingsStartDate.setSeconds(
        readingsStartDate.getSeconds() - logInterval * (numberOfLogsToIntegrate - 1),
      );
    } else startOfLogCounter = logCounter - numberOfReadings;

    returnData.logsToAdd = this.generateLogs(
      readingsStartDate,
      startOfReading,
      startOfLogCounter,
      logInterval,
      temperatureReadings,
    );
    return returnData;
  }

  if (lastLogCounter === logCounter) {
    returnData.returnMessage += 'log counter matches last record\n';
    return returnData;
  }
  if (lastTimestamp < readingsStartDate) {
    returnData.returnMessage += 'earliest reading date is after earliest log date \n';
    startOfLogCounter = logCounter - numberOfReadings;
    returnData.logsToAdd = this.generateLogs(
      readingsStartDate,
      startOfReading,
      startOfLogCounter,
      logInterval,
      temperatureReadings,
    );
    return returnData;
  }

  startOfLogCounter = lastLogCounter;
  startOfReading = numberOfReadings - (logCounter - startOfLogCounter);
  readingsStartDate = new Date(lastTimestamp);
  readingsStartDate.setSeconds(readingsStartDate.getSeconds() + logInterval);

  returnData.logsToAdd = this.generateLogs(
    readingsStartDate,
    startOfReading,
    startOfLogCounter,
    logInterval,
    temperatureReadings,
  );
  return returnData;
}

export function updateSensors(sensors, database) {
  Object.entries(sensors).forEach(([address, { name, advertismentData }]) => {
    const sensorData = parseSensorAdvertisment(advertismentData);
    addRefreshSensor({ address, name }, sensorData, database);
  });
}

function addRefreshSensor(sensorInfo, sensorData, database) {
  const sensors = database.objects('Sensor').filtered('address == $0', sensorInfo.address);
  database.write(() => {
    let id = generateUUID();
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
    latestBatteryLevel: advertismentData[8],
    latestValue: toInt(advertismentData, 13) / 10.0,
    logInterval: toInt(advertismentData, 9),
    latestValueTimestamp: new Date(),
  };
}

function toInt(byteArray, startPosition) {
  // negative temps ?
  return byteArray[startPosition] * 256 + byteArray[startPosition + 1];
}
