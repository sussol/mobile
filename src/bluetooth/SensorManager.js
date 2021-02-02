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

class SensorManager {
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

  createSensor = async ({ location: newLocation, logInterval, macAddress, name }) => {
    const id = this.utils.createUuid();
    let location = newLocation;

    if (!newLocation) {
      const locations = await this.db.getLocations();
      [location] = locations;
    }

    return this.sensorCreator({
      id,
      macAddress,
      name,
      location,
      logInterval,
      batteryLevel: 0,
      isActive: true,
    });
  };

  saveSensor = async sensor => this.db.upsertSensor(sensor);
}

let SensorManagerInstance;

export const getSensorManagerInstance = (dbService, utils) => {
  if (!SensorManagerInstance) {
    SensorManagerInstance = new SensorManager(dbService, utils);
  }
  return SensorManagerInstance;
};

export default getSensorManagerInstance;
