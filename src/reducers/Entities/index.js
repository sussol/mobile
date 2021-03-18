import { combineReducers } from 'redux';

import { TemperatureBreachConfigReducer } from './TemperatureBreachConfigReducer';
import { SensorReducer } from './SensorReducer';
import { LocationReducer } from './LocationReducer';
import { NameReducer } from './NameReducer';
import { NameNoteReducer } from './NameNoteReducer';
import { VaccinePrescriptionReducer } from './VaccinePrescriptionReducer';

export const EntitiesReducer = combineReducers({
  temperatureBreachConfiguration: TemperatureBreachConfigReducer,
  sensor: SensorReducer,
  location: LocationReducer,
  name: NameReducer,
  nameNote: NameNoteReducer,
  vaccinePrescription: VaccinePrescriptionReducer,
});
