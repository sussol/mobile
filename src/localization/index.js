export { authStrings } from './authStrings';
export { buttonStrings } from './buttonStrings';
export { generalStrings } from './generalStrings';
export { modalStrings } from './modalStrings';
export { navStrings } from './navStrings';
export { pageInfoStrings } from './pageInfoStrings';
export { setCurrentLanguage } from './utilities';
export { tableStrings } from './tableStrings';

// Order of pairs defines the order they show in the ListView of LanguageModal. Keep
// it alphabetical except for English, keep it at the top. JS objects don't guarentee insertion
// order, so if the default is ever reported wrong, that is a good place to look first.
const languageKeys = {
  gb: 'English',
  // fr: 'French',
  tl: 'Tetum',
};

export const DEFAULT_LANGUAGE = Object.keys(languageKeys)[0]; // i.e. English is the default
export const LANGUAGE_KEYS = languageKeys;

export const COUNTRY_FLAGS = {
  fr: require('../images/flags/fr.png'),
  gb: require('../images/flags/gb.png'),
  tl: require('../images/flags/tl.png'),
};
