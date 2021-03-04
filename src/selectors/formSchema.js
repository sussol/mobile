/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { UIDatabase } from '../database/index';

const PATIENT_SURVEY_TYPE = 'PatientSurvey';

export const selectSurveySchemas = () =>
  UIDatabase.objects('FormSchema').filtered(`type=='${PATIENT_SURVEY_TYPE}'`);
