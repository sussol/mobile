/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export { authStrings } from './authStrings';
export { buttonStrings } from './buttonStrings';
export { demoUserModalStrings } from './demoUserModalStrings';
export { generalStrings } from './generalStrings';
export { modalStrings } from './modalStrings';
export { navStrings } from './navStrings';
export { pageInfoStrings } from './pageInfoStrings';
export { setCurrentLanguage } from './utilities';
export { tableStrings } from './tableStrings';
export { syncStrings } from './syncStrings';
export { validationStrings } from './validationStrings';

// Order of pairs defines the order they show in the |ListView| of |LanguageModal|. Languages
// appear in alphabetical order, with the exception of English, which appears first.

// TODO: js objects do not guarantee ordering. Replace with data structure which does.
const languageKeys = {
  gb: 'English',
  gil: 'te taetae ni Kiribati',
  fr: 'French',
  tl: 'Tetum',
};

export const DEFAULT_LANGUAGE = Object.keys(languageKeys)[0]; // English as default.
export const LANGUAGE_KEYS = languageKeys;

export const COUNTRY_FLAGS = {
  /* eslint-disable global-require */
  fr: require('../images/flags/fr.png'),
  gb: require('../images/flags/gb.png'),
  gil: require('../images/flags/gil.png'),
  tl: require('../images/flags/tl.png'),
};
