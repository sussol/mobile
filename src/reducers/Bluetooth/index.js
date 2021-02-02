import { combineReducers } from 'redux';
import { BlinkReducer } from './BlinkReducer';
import { ScanReducer } from './ScanReducer';
import { UpdateReducer } from './UpdateReducer';

export const BluetoothReducer = combineReducers({
  blink: BlinkReducer,
  scan: ScanReducer,
  update: UpdateReducer,
});
