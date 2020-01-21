/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

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
} from './index';

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
