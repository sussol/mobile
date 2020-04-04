/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { combineReducers } from 'redux';

import { DashboardReducer } from './DashboardReducer';
import { DispensaryReducer } from './DispensaryReducer';
import { FinaliseReducer } from './FinaliseReducer';
import { FormReducer } from './FormReducer';
import { InsuranceReducer } from './InsuranceReducer';
import { ModulesReducer } from './ModulesReducer';
import { PagesReducer } from './PagesReducer';
import { PatientReducer } from './PatientReducer';
import { PaymentReducer } from './PaymentReducer';
import { PrescriberReducer } from './PrescriberReducer';
import { PrescriptionReducer } from './PrescriptionReducer';
import { SupplierCreditReducer } from './SupplierCreditReducer';
import { UserReducer } from './UserReducer';
import { WizardReducer } from './WizardReducer';
import { TemperatureSyncReducer } from './TemperatureSyncReducer';
import { FridgeReducer } from './FridgeReducer';

import SyncReducer from './SyncReducer';

export default combineReducers({
  dashboard: DashboardReducer,
  dispensary: DispensaryReducer,
  finalise: FinaliseReducer,
  form: FormReducer,
  insurance: InsuranceReducer,
  modules: ModulesReducer,
  pages: PagesReducer,
  patient: PatientReducer,
  payment: PaymentReducer,
  prescriber: PrescriberReducer,
  prescription: PrescriptionReducer,
  supplierCredit: SupplierCreditReducer,
  sync: SyncReducer,
  temperatureSync: TemperatureSyncReducer,
  user: UserReducer,
  wizard: WizardReducer,
  fridge: FridgeReducer,
});
