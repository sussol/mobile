import { combineReducers } from 'redux';

import { TemperatureBreachConfigReducer } from './TemperatureBreachConfigReducer';
import { SensorReducer } from './SensorReducer';
import { LocationReducer } from './LocationReducer';

export const EntitiesReducer = combineReducers({
  temperatureBreachConfiguration: TemperatureBreachConfigReducer,
  sensor: SensorReducer,
  location: LocationReducer,
});
