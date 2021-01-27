import { SensorManager } from './SensorManager';

describe('SensorManager: saveSensor', () => {
  it('Creates sensor with expected defaults', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };
    const sensorManager = new SensorManager(dbService, utils);

    const sensor = {
      id: 'a',
      isActive: true,
      location: null,
      logInterval: 300,
      macAddress: '00:AA:BB:CC:DD:EE:FF',
      name: 'A sensor',
    };

    const shouldBe = {
      id: '1',
      batteryLevel: 0,
      isActive: true,
      location: null,
      logInterval: 300,
      macAddress: '00:AA:BB:CC:DD:EE:FF',
      name: 'A sensor',
    };

    expect(sensorManager.createSensor(sensor)).toEqual(shouldBe);
  });
});
