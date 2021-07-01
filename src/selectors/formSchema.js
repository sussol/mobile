/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { UIDatabase } from '../database/index';

const PATIENT_SURVEY_TYPE = 'PatientSurvey';
const VACCINE_SITE_TYPE = 'VaccineSite';

export const selectSurveySchemas = () =>
  UIDatabase.objects('FormSchema').filtered(`type=='${PATIENT_SURVEY_TYPE}'`);

export const selectSiteSchemas = () =>
  UIDatabase.objects('FormSchema').filtered(`type=='${VACCINE_SITE_TYPE}'`);
