import { combineReducers } from 'redux';

import { TemperatureBreachConfigReducer } from './TemperatureBreachConfigReducer';
import { SensorReducer } from './SensorReducer';

export const EntitiesReducer = combineReducers({
  temperatureBreachConfiguration: TemperatureBreachConfigReducer,
  sensor: SensorReducer,
});
