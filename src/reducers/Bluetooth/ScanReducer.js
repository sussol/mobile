import { SCAN_ACTIONS } from '../../actions/Bluetooth/ScanActions';

const initialState = () => ({
  isScanning: false,
  scannedSensorAddresses: [],
});

export const ScanReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case SCAN_ACTIONS.SCAN_START: {
      return {
        ...state,
        isScanning: true,
        scannedSensorAddresses: [],
      };
    }

    case SCAN_ACTIONS.SCAN_STOP: {
      return {
        ...state,
        scannedSensorAddresses: [],
        isScanning: false,
      };
    }

    case SCAN_ACTIONS.SENSOR_FOUND: {
      const { payload } = action;
      const { macAddress } = payload;

      const { scannedSensorAddresses = [] } = state;

      return {
        ...state,
        scannedSensorAddresses: [...scannedSensorAddresses, macAddress],
      };
    }
    default:
      return state;
  }
};
