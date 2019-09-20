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

export const LANGUAGE_CODES = {
  ENGLISH: 'gb',
  KIRIBATI: 'gil',
  FRENCH: 'fr',
  TETUM: 'tl',
  LAOS: 'la',
};

export const LANGUAGE_NAMES = {
  [LANGUAGE_CODES.ENGLISH]: 'English',
  [LANGUAGE_CODES.KIRIBATI]: 'te taetae ni Kiribati',
  [LANGUAGE_CODES.FRENCH]: 'French',
  [LANGUAGE_CODES.TETUM]: 'Tetum',
  [LANGUAGE_CODES.LAOS]: 'Laos',
};

export const LANGUAGE_CHOICE = [
  { code: LANGUAGE_CODES.ENGLISH, name: LANGUAGE_NAMES[LANGUAGE_CODES.ENGLISH] },
  { code: LANGUAGE_CODES.FRENCH, name: LANGUAGE_NAMES[LANGUAGE_CODES.FRENCH] },
  { code: LANGUAGE_CODES.KIRIBATI, name: LANGUAGE_NAMES[LANGUAGE_CODES.KIRIBATI] },
  { code: LANGUAGE_CODES.LAOS, name: LANGUAGE_NAMES[LANGUAGE_CODES.LAOS] },
  { code: LANGUAGE_CODES.TETUM, name: LANGUAGE_NAMES[LANGUAGE_CODES.TETUM] },
];

export const DEFAULT_LANGUAGE = LANGUAGE_CODES.ENGLISH;
