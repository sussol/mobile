import { authStrings } from './authStrings';
import { buttonStrings } from './buttonStrings';
import { generalStrings } from './generalStrings';
import { modalStrings } from './modalStrings';
import { navStrings } from './navStrings';
import { pageInfoStrings } from './pageInfoStrings';
import { tableStrings } from './tableStrings';

export function setCurrentLanguage(language) {
  authStrings.setLanguage(language);
  buttonStrings.setLanguage(language);
  generalStrings.setLanguage(language);
  modalStrings.setLanguage(language);
  navStrings.setLanguage(language);
  pageInfoStrings.setLanguage(language);
  tableStrings.setLanguage(language);
}
