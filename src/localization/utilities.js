/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import moment from 'moment';
import french from 'moment/locale/fr';
import english from 'moment/locale/en-nz';

import {
  authStrings,
  buttonStrings,
  generalStrings,
  modalStrings,
  navStrings,
  pageInfoStrings,
  programStrings,
  syncStrings,
  tableStrings,
  LANGUAGE_CODES,
} from './index';

const DATE_CONFIGS = {
  DEFAULT: english,
  [LANGUAGE_CODES.FRENCH]: french,
};

export const setDateLocale = languageCode =>
  moment.updateLocale(languageCode, DATE_CONFIGS[languageCode] || DATE_CONFIGS.DEFAULT);

export function setCurrentLanguage(language) {
  authStrings.setLanguage(language);
  buttonStrings.setLanguage(language);
  generalStrings.setLanguage(language);
  modalStrings.setLanguage(language);
  navStrings.setLanguage(language);
  pageInfoStrings.setLanguage(language);
  tableStrings.setLanguage(language);
  syncStrings.setLanguage(language);
  programStrings.setLanguage(language);
}

export default setCurrentLanguage;
