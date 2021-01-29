import { combineReducers } from 'redux';
import { BlinkReducer } from './BlinkReducer';

export const BluetoothReducer = combineReducers({ blink: BlinkReducer });
