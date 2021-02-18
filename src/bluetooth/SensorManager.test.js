import SensorManager from './SensorManager';

describe('SensorManager: saveSensor', () => {
  it('Creates sensor with expected defaults', async () => {
    const dummyLocation = {
      id: 1,
      code: 'a',
      name: 'Location A',
    };
    const dbService = { getLocations: () => [dummyLocation] };
    const utils = { createUuid: () => '1' };
    const sensorManager = SensorManager(dbService, utils);

    const sensor = {
      id: 'a',
      isActive: true,
      location: dummyLocation,
      logInterval: 300,
      macAddress: '00:AA:BB:CC:DD:EE:FF',
      name: 'A sensor',
    };

    const shouldBe = {
      id: '1',
      batteryLevel: undefined,
      isActive: true,
      location: dummyLocation,
      logInterval: 300,
      macAddress: '00:AA:BB:CC:DD:EE:FF',
      name: 'A sensor',
      logDelay: undefined,
    };
    const newSensor = await sensorManager.createSensor(sensor);
    expect(newSensor).toEqual(shouldBe);
  });
});
