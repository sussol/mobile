import { VACCINE_ACTIONS } from '../actions/VaccineActions';
import BleService from '../bluetooth/BleService';

const initialState = () => ({
  total: 0,
  isScanning: false,
  sensors: [],
});

const blinkSensor = async macAddress => {
  const error = null;
  await BleService().blinkWithRetries(macAddress, 3, error);
  if (error) {
    console.errror(error);
  }
};

export const VaccineReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case VACCINE_ACTIONS.BLINK: {
      const { payload } = action;
      const { macAddress } = payload;
      const { sensors } = state;
      const sensor = sensors.find(s => s.macAddress === macAddress) || {
        macAddress,
        blinking: false,
      };

      blinkSensor(macAddress);
      sensor.blinking = true;
      // BleService().scanForSensors(device => console.info('boop', device));

      return { ...state, sensors: [...sensors.filter(s => s.macAddress !== macAddress), sensor] };
    }

    default:
      return state;
  }
};
