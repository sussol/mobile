/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { combineReducers } from 'redux';

import { FinaliseReducer } from './FinaliseReducer';
import { FormReducer } from './FormReducer';
import { ModulesReducer } from './ModulesReducer';
import { PagesReducer } from './PagesReducer';
import { PatientReducer } from './PatientReducer';
import { PaymentReducer } from './PaymentReducer';
import { PrescriberReducer } from './PrescriberReducer';
import { PrescriptionReducer } from './PrescriptionReducer';
import { UserReducer } from './UserReducer';
import { WizardReducer } from './WizardReducer';
import NavigationReducer from './NavigationReducer';
import SyncReducer from './SyncReducer';

export default combineReducers({
  user: UserReducer,
  nav: NavigationReducer,
  sync: SyncReducer,
  pages: PagesReducer,
  modules: ModulesReducer,
  prescription: PrescriptionReducer,
  patient: PatientReducer,
  prescriber: PrescriberReducer,
  form: FormReducer,
  finalise: FinaliseReducer,
  wizard: WizardReducer,
  payment: PaymentReducer,
});
