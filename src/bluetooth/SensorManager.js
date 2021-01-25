// Default sensor generator.
const createSensor = ({ id, macAddress, name, location, batteryLevel, isActive, logInterval }) => ({
  id,
  macAddress,
  name,
  location,
  batteryLevel,
  isActive,
  logInterval,
});

export class SensorManager {
  constructor(dbService, utils) {
    this.db = dbService;
    this.utils = utils;

    this.createSensorFunc = createSensor;
  }

  set sensorCreator(createSensorFunc) {
    this.createSensorFunc = createSensorFunc;
  }

  get sensorCreator() {
    return this.createSensorFunc;
  }

  createSensor({ location, logInterval, macAddress, name }) {
    const id = this.utils.createUuid();

    return this.sensorCreator({
      id,
      macAddress,
      name,
      location,
      batteryLevel: 0,
      isActive: true,
      logInterval,
    });
  }

  saveSensor = async sensor => this.db.upsertSensor(sensor);
}

let SensorManagerInstance;

export const getSensorManagerInstance = (dbService, utils) => {
  if (!SensorManagerInstance) {
    SensorManagerInstance = new SensorManagerInstance(dbService, utils);
  }
  return SensorManagerInstance;
};

export default getSensorManagerInstance;
