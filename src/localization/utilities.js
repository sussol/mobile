/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { authStrings } from './authStrings';
import { buttonStrings } from './buttonStrings';
import { generalStrings } from './generalStrings';
import { modalStrings } from './modalStrings';
import { navStrings } from './navStrings';
import { pageInfoStrings } from './pageInfoStrings';
import { syncStrings } from './syncStrings';
import { tableStrings } from './tableStrings';
import { programStrings } from './programStrings';

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
