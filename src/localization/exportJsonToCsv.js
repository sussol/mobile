/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable no-shadow */
/* eslint-disable guard-for-in */
/* eslint-disable prefer-const */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */

const fs = require('fs');
const authStrings = require('../localization/authStrings.json');
const buttonStrings = require('../localization/buttonStrings.json');
const demoUserModalStrings = require('../localization/demoUserModalStrings.json');
const generalStrings = require('../localization/generalStrings.json');
const modalStrings = require('../localization/modalStrings.json');
const navStrings = require('../localization/navStrings.json');
const pageInfoStrings = require('../localization/pageInfoStrings.json');
const programStrings = require('../localization/programStrings.json');
const syncStrings = require('../localization/syncStrings.json');
const tableStrings = require('../localization/tableStrings.json');
const validationStrings = require('../localization/validationStrings.json');

const mainLanguage = 'gb';

const localizationFiles = [
  authStrings,
  buttonStrings,
  demoUserModalStrings,
  generalStrings,
  modalStrings,
  navStrings,
  pageInfoStrings,
  programStrings,
  syncStrings,
  tableStrings,
  validationStrings,
];

authStrings.name = 'authStrings';
buttonStrings.name = 'buttonStrings';
demoUserModalStrings.name = 'demoUserModalStrings';
generalStrings.name = 'generalStrings';
modalStrings.name = 'modalStrings';
navStrings.name = 'navStrings';
pageInfoStrings.name = 'pageInfoStrings';
programStrings.name = 'programStrings';
syncStrings.name = 'syncStrings';
tableStrings.name = 'tableStrings';
validationStrings.name = 'validationStrings';

getSelectedLanguage = () => process.argv[2];

const saveCsvFile = (mainLanguage, selectedLanguage) => {
  let valueFound = false;
  let csvFileData = '';

  for (localizationFile of localizationFiles) {
    const mainLanguageKeys = [];
    const mainLanguageValues = [];
    const selectedLanguageValues = [];

    // iterates over every language
    for (const [language, mainLanguageKey] of Object.entries(localizationFile)) {
      // iterates over the mainLanguage data
      if (language === mainLanguage) {
        // save all the needed data in values
        for (let [mainLanguageKeyAgain, mainLanguageValue] of Object.entries(mainLanguageKey)) {
          mainLanguageKeys.push(mainLanguageKeyAgain);
          mainLanguageValue = mainLanguageValue.replace(/\n/g, ' ');
          mainLanguageValues.push(mainLanguageValue);
        }
      }
      // iterates over the selectedLanguage
      if (language === selectedLanguage) {
        //
        for (selectedLanguageKey of mainLanguageKeys) {
          valueFound = false;

          for (let [selectedLanguageKeyAgain, selectedLanguageValue] of Object.entries(
            mainLanguageKey
          )) {
            if (selectedLanguageKey === selectedLanguageKeyAgain && valueFound === false) {
              selectedLanguageValue = selectedLanguageValue.replace(/\n/g, ' ');
              selectedLanguageValues.push(selectedLanguageValue);
              valueFound = true;
            }
          }
          if (valueFound === false) {
            selectedLanguageValues.push('');
            valueFound = false;
          }
        }
      }
    }
    for (mainLanguageKey in mainLanguageKeys) {
      // eslint-disable-next-line no-undef
      csvFileData = `${csvFileData} ${localizationFile.name}:${mainLanguageKeys[mainLanguageKey]},"${mainLanguageValues[mainLanguageKey]}","${selectedLanguageValues[mainLanguageKey]}"\n`;
    }
  }
  return csvFileData;
};

writeCsvFile = (selectedLanguage, csvFileData) => {
  fs.writeFile(`${selectedLanguage}.csv`, csvFileData, 'utf8', err => {
    if (err) {
      console.log('Error - file either not saved or corrupted file saved.');
    } else {
      console.log(`File ${selectedLanguage}.csv saved!`);
    }
  });
};

executeApplication = () => {
  const selectedLanguage = getSelectedLanguage();
  const csvFileData = saveCsvFile(mainLanguage, selectedLanguage);
  writeCsvFile(selectedLanguage, csvFileData);
};

executeApplication();
