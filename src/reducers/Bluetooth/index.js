import { combineReducers } from 'redux';
import { SensorBlinkReducer } from './SensorBlinkReducer';
import { SensorScanReducer } from './SensorScanReducer';
import { SensorUpdateReducer } from './SensorUpdateReducer';

export const BluetoothReducer = combineReducers({
  blink: SensorBlinkReducer,
  scan: SensorScanReducer,
  update: SensorUpdateReducer,
});
