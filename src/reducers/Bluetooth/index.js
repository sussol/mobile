import { combineReducers } from 'redux';
import { SensorBlinkReducer } from './SensorBlinkReducer';
import { SensorScanReducer } from './SensorScanReducer';
import { SensorUpdateReducer } from './SensorUpdateReducer';
import { SensorDownloadReducer } from './SensorDownloadReducer';

export const BluetoothReducer = combineReducers({
  blink: SensorBlinkReducer,
  download: SensorDownloadReducer,
  scan: SensorScanReducer,
  update: SensorUpdateReducer,
});
