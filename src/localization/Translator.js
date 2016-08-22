/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { authStrings } from './authStrings';
import { buttonStrings } from './buttonStrings';
import { modalStrings } from './modalStrings';
import { navStrings } from './navStrings';
import { pageInfoStrings } from './pageInfoStrings';
import { tableStrings } from './tableStrings';

export const TranslationManager = new class {
  constructor() {
    this.time = new Date();
  }

  setCurrentLanguage(language) {
    authStrings.setLanguage(language);
    buttonStrings.setLanguage(language);
    modalStrings.setLanguage(language);
    navStrings.setLanguage(language);
    pageInfoStrings.setLanguage(language);
    tableStrings.setLanguage(language);
  }

  get authStrings() {
    return authStrings;
  }

  get buttonStrings() {
    return buttonStrings;
  }

  get modalStrings() {
    return modalStrings;
  }

  get navStrings() {
    return navStrings;
  }

  get pageInfoStrings() {
    return pageInfoStrings;
  }

  get tableStrings() {
    return tableStrings;
  }
};
