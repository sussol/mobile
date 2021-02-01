import { combineReducers } from 'redux';

import { LocationReducer } from './LocationReducer';
import { TemperatureBreachConfigReducer } from './TemperatureBreachConfigReducer';
import { SensorReducer } from './SensorReducer';

export const EntitiesReducer = combineReducers({
  location: LocationReducer,
  temperatureBreachConfiguration: TemperatureBreachConfigReducer,
  sensor: SensorReducer,
});
