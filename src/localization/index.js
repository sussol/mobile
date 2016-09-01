export { authStrings } from './authStrings';
export { buttonStrings } from './buttonStrings';
export { modalStrings } from './modalStrings';
export { navStrings } from './navStrings';
export { pageInfoStrings } from './pageInfoStrings';
export { tableStrings } from './tableStrings';
export { setCurrentLanguage } from './utilities';

// Order of pairs defines the order they show in the ListView of LanguageModal. Keep
// it alphabetical.
export const LANGUAGE_KEYS = {
  gb: 'English',
  // fr: 'French',
  // tl: 'Tetum',
};

export const COUNTRY_FLAGS = {
  fr: require('../images/flags/fr.png'),
  gb: require('../images/flags/gb.png'),
  tl: require('../images/flags/tl.png'),
};
