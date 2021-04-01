import moment from 'moment';
import { ToastAndroid } from 'react-native';
import BreachManager from '../../bluetooth/BreachManager';
import { VaccineDataAccess } from '../../bluetooth/VaccineDataAccess';
import { MILLISECONDS } from '../../utilities/constants';
import { createRecord, UIDatabase } from '../index';

const createTemperatureLogs = (sensor, idSuffix, logCount, generateTemperature) => {
  const { location, logInterval } = sensor;
  const currentDate = new Date();
  let count = 0;

  for (let i = -1 * logCount; i < logCount; i++) {
    const temperature = generateTemperature(i);
    count += 1;
    UIDatabase.create('TemperatureLog', {
      id: `${i}${idSuffix}`,
      temperature,
      logInterval,
      timestamp: new Date(currentDate - logInterval * 1000 * count),
      location,
      sensor,
    });
  }
};

export const createVaccineData = () => {
  UIDatabase.write(() => {
    const oldLocations = UIDatabase.objects('Location');
    UIDatabase.delete('Location', oldLocations);
    const oldConfigs = UIDatabase.objects('TemperatureBreachConfiguration');
    UIDatabase.delete('TemperatureBreachConfiguration', oldConfigs);
    const oldSensors = UIDatabase.objects('Sensor');
    UIDatabase.delete('Sensor', oldSensors);
    const oldLogs = UIDatabase.objects('TemperatureLog');
    UIDatabase.delete('TemperatureLog', oldLogs);
    const oldUIDatabaseBreaches = UIDatabase.objects('TemperatureBreach');
    UIDatabase.delete('TemperatureBreach', oldUIDatabaseBreaches);

    // create locations
    const fridge1 = createRecord(UIDatabase, 'Location', { description: 'Fridge 1', code: 'f1' });
    const fridge2 = createRecord(UIDatabase, 'Location', { description: 'Fridge 2', code: 'f2' });
    const fridge3 = createRecord(UIDatabase, 'Location', { description: 'Fridge 3', code: 'f3' });
    const fridge4 = createRecord(UIDatabase, 'Location', { description: 'Fridge 4', code: 'f4' });
    const fridge5 = createRecord(UIDatabase, 'Location', { description: 'Fridge 5', code: 'f5' });

    // create sensors
    createRecord(UIDatabase, 'Sensor', {
      name: 'sensor 1',
      batteryLevel: 10,
      location: fridge1,
      logDelay: new Date(0),
      macAddress: '00:00:00:00:01',
      programmedDate: new Date(),
    });
    createRecord(UIDatabase, 'Sensor', {
      name: 'sensor 2',
      batteryLevel: 20,
      location: fridge2,
      macAddress: '00:00:00:00:02',
      logDelay: new Date(0),
      programmedDate: new Date(),
    });
    createRecord(UIDatabase, 'Sensor', {
      name: 'sensor 3',
      batteryLevel: 30,
      location: fridge3,
      macAddress: '00:00:00:00:03',
      logDelay: new Date(0),
      programmedDate: new Date(),
    });
    createRecord(UIDatabase, 'Sensor', {
      name: 'sensor 4',
      batteryLevel: 40,
      location: fridge4,
      macAddress: '00:00:00:00:04',
      logDelay: new Date(0),
      programmedDate: new Date(),
    });
    createRecord(UIDatabase, 'Sensor', {
      name: 'sensor 5',
      batteryLevel: 50,
      location: fridge5,
      macAddress: '00:00:00:00:05',
      logDelay: new Date(0),
      programmedDate: new Date(),
    });

    // create some configs
    UIDatabase.objects('Location').forEach((location, i) => {
      const { id: locationID } = location;
      UIDatabase.update('TemperatureBreachConfiguration', {
        id: `${locationID}${i + 1}`,
        minimumTemperature: 8,
        maximumTemperature: 999,
        duration: 20 * MILLISECONDS.ONE_MINUTE,
        description: 'Config 1, 8 to 999 consecutive for 20 minutes',
        type: 'HOT_CONSECUTIVE',
        location,
      });

      UIDatabase.update('TemperatureBreachConfiguration', {
        id: `${locationID}${i + 2}`,
        minimumTemperature: -999,
        maximumTemperature: 0,
        duration: 20 * MILLISECONDS.ONE_MINUTE,
        description: 'Config 1, 0 to -999 consecutive for 20 minutes',
        type: 'COLD_CONSECUTIVE',
        location,
      });

      UIDatabase.update('TemperatureBreachConfiguration', {
        id: `${locationID}${i + 3}`,
        minimumTemperature: 8,
        maximumTemperature: 999,
        duration: 60 * MILLISECONDS.ONE_MINUTE,
        description: 'Config 1, 8 to 999 cumulative for 1 hour',
        type: 'HOT_CUMULATIVE',
        location,
      });

      UIDatabase.update('TemperatureBreachConfiguration', {
        id: `${locationID}${i + 4}`,
        minimumTemperature: -999,
        maximumTemperature: 0,
        duration: 60 * MILLISECONDS.ONE_MINUTE,
        description: 'Config 1, 0 to -999 cumulative',
        type: 'COLD_CUMULATIVE',
        location,
      });
    });

    // create some logs. Leaving one location with no logs for handling that situation
    // sorting the sensors, so that the log generation methods align with the sensors
    const sensors = UIDatabase.objects('Sensor').sorted('name');
    const twoDPInt = x => Math.floor(100 * x) / 100;
    const buildGenerator = (base, factor) => () => twoDPInt(base + factor * Math.random());
    const generatorA = () => {
      // fluctuates between 2-6 degrees with some big spikes
      const r = Math.random();
      const realTemp = 2 + 4 * r;

      if (r > 0.985) {
        return twoDPInt(realTemp + 20 * Math.random());
      }

      if (r < 0.015) {
        return twoDPInt(realTemp - 20 * Math.random());
      }

      return twoDPInt(realTemp);
    };

    createTemperatureLogs(sensors[0], 'a', 250, generatorA);
    // fluctuates between 20 & 30 degrees
    createTemperatureLogs(sensors[1], 'b', 100, buildGenerator(20, 10));
    // fluctuates between -15 & -25 degrees
    createTemperatureLogs(sensors[2], 'c', 50, buildGenerator(-15, -10));
    // fluctuates between 2 & 6 degrees
    createTemperatureLogs(sensors[3], 'd', 200, buildGenerator(2, 4));
  });

  // create breaches
  const utils = {};
  utils.createUuid = () => String(Math.random());
  const vaccineDB = new VaccineDataAccess(UIDatabase);
  const breachManager = BreachManager(vaccineDB, utils);
  const sensors = UIDatabase.objects('Sensor');
  const configs = vaccineDB.getBreachConfigs();

  const promises = sensors.map(sensor => {
    const [breaches, logs] = breachManager.createBreaches(
      sensor,
      sensor.logs.sorted('timestamp').map(({ id, temperature, timestamp }) => ({
        id,
        temperature,
        timestamp: moment(timestamp).unix(),
      })),
      configs
    );
    return breachManager.updateBreaches(breaches, logs);
  });
  Promise.all(promises).then(() => ToastAndroid.show('Data generated', ToastAndroid.SHORT));
};
