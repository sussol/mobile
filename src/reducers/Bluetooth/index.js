import { combineReducers } from 'redux';
import { BlinkReducer } from './BlinkReducer';
import { ScanReducer } from './ScanReducer';

export const BluetoothReducer = combineReducers({ blink: BlinkReducer, scan: ScanReducer });
