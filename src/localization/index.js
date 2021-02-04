/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import LocalizedStrings from 'react-native-localization';

import authStringsJSON from './authStrings.json';
import buttonStringsJSON from './buttonStrings.json';
import demoUserModalStringsJSON from './demoUserModalStrings.json';
import generalStringsJSON from './generalStrings.json';
import modalStringsJSON from './modalStrings.json';
import navStringsJSON from './navStrings.json';
import pageInfoStringsJSON from './pageInfoStrings.json';
import programStringsJSON from './programStrings.json';
import syncStringsJSON from './syncStrings.json';
import tableStringsJSON from './tableStrings.json';
import validationStringsJSON from './validationStrings.json';
import formInputStringsJSON from './formInputStrings.json';
import dispensingStringsJSON from './dispensingStrings.json';
import vaccineStringsJSON from './vaccineStrings.json';
import reportStringsJSON from './reportStrings.json';

export const authStrings = new LocalizedStrings(authStringsJSON);
export const buttonStrings = new LocalizedStrings(buttonStringsJSON);
export const demoUserModalStrings = new LocalizedStrings(demoUserModalStringsJSON);
export const generalStrings = new LocalizedStrings(generalStringsJSON);
export const modalStrings = new LocalizedStrings(modalStringsJSON);
export const navStrings = new LocalizedStrings(navStringsJSON);
export const pageInfoStrings = new LocalizedStrings(pageInfoStringsJSON);
export const programStrings = new LocalizedStrings(programStringsJSON);
export const syncStrings = new LocalizedStrings(syncStringsJSON);
export const tableStrings = new LocalizedStrings(tableStringsJSON);
export const validationStrings = new LocalizedStrings(validationStringsJSON);
export const formInputStrings = new LocalizedStrings(formInputStringsJSON);
export const dispensingStrings = new LocalizedStrings(dispensingStringsJSON);
export const vaccineStrings = new LocalizedStrings(vaccineStringsJSON);
export const reportStrings = new LocalizedStrings(reportStringsJSON);

export const LANGUAGE_CODES = {
  ENGLISH: 'gb',
  FRENCH: 'fr',
  KIRIBATI: 'gil',
  LAOS: 'la',
  MYANMAR: 'my',
  PORTUGUESE: 'pt',
  SPANISH: 'es',
  TETUM: 'tl',
};

export const LANGUAGE_NAMES = {
  [LANGUAGE_CODES.ENGLISH]: 'English',
  [LANGUAGE_CODES.FRENCH]: 'French',
  [LANGUAGE_CODES.KIRIBATI]: 'te taetae ni Kiribati',
  [LANGUAGE_CODES.LAOS]: 'Laos',
  [LANGUAGE_CODES.MYANMAR]: 'Myanmar',
  [LANGUAGE_CODES.PORTUGUESE]: 'Portuguese',
  [LANGUAGE_CODES.SPANISH]: 'Spanish',
  [LANGUAGE_CODES.TETUM]: 'Tetum',
};

export const LANGUAGE_CHOICE = [
  { code: LANGUAGE_CODES.ENGLISH, name: LANGUAGE_NAMES[LANGUAGE_CODES.ENGLISH] },
  { code: LANGUAGE_CODES.FRENCH, name: LANGUAGE_NAMES[LANGUAGE_CODES.FRENCH] },
  { code: LANGUAGE_CODES.KIRIBATI, name: LANGUAGE_NAMES[LANGUAGE_CODES.KIRIBATI] },
  { code: LANGUAGE_CODES.LAOS, name: LANGUAGE_NAMES[LANGUAGE_CODES.LAOS] },
  { code: LANGUAGE_CODES.MYANMAR, name: LANGUAGE_NAMES[LANGUAGE_CODES.MYANMAR] },
  { code: LANGUAGE_CODES.PORTUGUESE, name: LANGUAGE_NAMES[LANGUAGE_CODES.PORTUGUESE] },
  { code: LANGUAGE_CODES.SPANISH, name: LANGUAGE_NAMES[LANGUAGE_CODES.SPANISH] },
  { code: LANGUAGE_CODES.TETUM, name: LANGUAGE_NAMES[LANGUAGE_CODES.TETUM] },
];

export const DEFAULT_LANGUAGE = LANGUAGE_CODES.ENGLISH;
