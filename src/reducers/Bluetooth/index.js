import { combineReducers } from 'redux';
import { SensorBlinkReducer } from './SensorBlinkReducer';
import { SensorScanReducer } from './SensorScanReducer';
import { SensorUpdateReducer } from './SensorUpdateReducer';
import { DownloadReducer } from './DownloadReducer';

export const BluetoothReducer = combineReducers({
  blink: SensorBlinkReducer,
  download: DownloadReducer,
  scan: SensorScanReducer,
  update: SensorUpdateReducer,
});
