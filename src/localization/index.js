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
export { programStrings } from './programStrings';

export const LANGUAGES = {
  ENGLISH: {
    CODE: 'gb',
    NAME: 'English',
  },
  KIRIBATI: {
    CODE: 'gil',
    NAME: 'te taetae ni Kiribati',
  },
  FRENCH: {
    CODE: 'fr',
    NAME: 'French',
  },
  TETUM: {
    CODE: 'tl',
    NAME: 'Tetum',
  },
  LAOS: {
    CODE: 'la',
    NAME: 'Laos',
  },
};

export const LANGUAGE_CHOICE = [
  { code: LANGUAGES.ENGLISH.CODE, name: LANGUAGES.ENGLISH.NAME },
  { code: LANGUAGES.FRENCH.CODE, name: LANGUAGES.FRENCH.NAME },
  { code: LANGUAGES.KIRIBATI.CODE, name: LANGUAGES.KIRIBATI.NAME },
  { code: LANGUAGES.LAOS.CODE, name: LANGUAGES.LAOS.NAME },
  { code: LANGUAGES.TETUM.CODE, name: LANGUAGES.TETUM.NAME },
];

export const DEFAULT_LANGUAGE = LANGUAGES.ENGLISH.CODE;
