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

export const Translator = new class {
  constructor() {
    this.currentLanguage = 'en';
    this.time = new Date();
  }

  // set currentLanguage(language) {
  //   this.currentLanguage = language;
  // }

  get authStrings() {
    console.log(`authStrings: ${this.currentLanguage}`);
    console.log(this.time);
    return authStrings[this.currentLanguage];
  }

  get buttonStrings() {
    return buttonStrings[this.currentLanguage];
  }

  get modalStrings() {
    return modalStrings[this.currentLanguage];
  }

  get navStrings() {
    return navStrings[this.currentLanguage];
  }

  get pageInfoStrings() {
    return pageInfoStrings[this.currentLanguage];
  }

  get tableStrings() {
    return tableStrings[this.currentLanguage];
  }
};
