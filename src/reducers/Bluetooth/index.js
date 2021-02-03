import { combineReducers } from 'redux';
import { BlinkReducer } from './BlinkReducer';
import { ScanReducer } from './ScanReducer';
import { DownloadReducer } from './DownloadReducer';

export const BluetoothReducer = combineReducers({
  blink: BlinkReducer,
  scan: ScanReducer,
  download: DownloadReducer,
});
