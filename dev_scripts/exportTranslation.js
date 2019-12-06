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
const authStrings = require('../src/localization/authStrings.json');
const buttonStrings = require('../src/localization/buttonStrings.json');
const demoUserModalStrings = require('../src/localization/demoUserModalStrings.json');
const generalStrings = require('../src/localization/generalStrings.json');
const modalStrings = require('../src/localization/modalStrings.json');
const navStrings = require('../src/localization/navStrings.json');
const pageInfoStrings = require('../src/localization/pageInfoStrings.json');
const programStrings = require('../src/localization/programStrings.json');
const syncStrings = require('../src/localization/syncStrings.json');
const tableStrings = require('../src/localization/tableStrings.json');
const validationStrings = require('../src/localization/validationStrings.json');

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

// mainLanguage is English
const mainLanguage = 'gb';

// get the third command line argument
getSelectedLanguage = () => process.argv[2];

saveCsvFile = (mainLanguage, selectedLanguage) => {
  let valueFound = false;
  // keeps all the data coming from the json files
  let csvFileData = '';

  // go through all localization files
  for (localizationFile of localizationFiles) {
    const mainLanguageKeys = [];
    const mainLanguageValues = [];
    const selectedLanguageValues = [];

    // iterates over every language
    for (const [language, mainLanguageKey] of Object.entries(localizationFile)) {
      // iterates over the mainLanguage data
      if (language === mainLanguage) {
        // save all the mainLanguage data in mainLanguageValues
        for (let [mainLanguageKeyAgain, mainLanguageValue] of Object.entries(mainLanguageKey)) {
          mainLanguageKeys.push(mainLanguageKeyAgain);
          // eslint-disable-next-line no-useless-escape
          mainLanguageValue = mainLanguageValue.replace(/\n/g, ' ').replace(/[\"]/g, '');
          mainLanguageValues.push(mainLanguageValue);
        }
      }
      // iterates over the selectedLanguage
      if (language === selectedLanguage) {
        // use the mainLanguageKeys array to iterates over the selectedLanguage
        for (selectedLanguageKey of mainLanguageKeys) {
          valueFound = false;

          // save all the selectedLanguage data in selectedLanguageValues
          for (let [selectedLanguageKeyAgain, selectedLanguageValue] of Object.entries(
            mainLanguageKey
          )) {
            if (selectedLanguageKey === selectedLanguageKeyAgain && valueFound === false) {
              selectedLanguageValue = selectedLanguageValue
                .replace(/\n/g, ' ')
                // eslint-disable-next-line no-useless-escape
                .replace(/[\"]/g, '');
              selectedLanguageValues.push(selectedLanguageValue);
              // stops searching the selectedLanguageKey if it was found
              valueFound = true;
            }
          }
          if (valueFound === false) {
            // selectedLanguage does not have a value for the key
            selectedLanguageValues.push('');
            valueFound = false;
          }
        }
      }
    }
    // iterates over mainLanguageKeys to save the data of every localizationFile
    for (mainLanguageKey in mainLanguageKeys) {
      // eslint-disable-next-line no-undef
      csvFileData = `${csvFileData} ${localizationFile.name}:${mainLanguageKeys[mainLanguageKey]},"${mainLanguageValues[mainLanguageKey]}","${selectedLanguageValues[mainLanguageKey]}"\n`;
    }
  }
  return csvFileData;
};

writeCsvFile = (selectedLanguage, csvFileData) => {
  fs.writeFile(
    `./src/localization/translations/${selectedLanguage}.csv`,
    csvFileData,
    'utf8',
    err => {
      if (err) {
        console.log('Error - file either not saved or corrupted file saved.');
      } else {
        console.log(`File ${selectedLanguage}.csv saved!`);
      }
    }
  );
};

executeJsonToCsv = () => {
  const selectedLanguage = getSelectedLanguage();
  const csvFileData = saveCsvFile(mainLanguage, selectedLanguage);
  writeCsvFile(selectedLanguage, csvFileData);
};

executeJsonToCsv();
