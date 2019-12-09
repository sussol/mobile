/* eslint-disable array-callback-return */
/* eslint-disable func-names */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-console */
/* eslint-disable no-useless-escape */
/* eslint-disable no-shadow */
/* eslint-disable guard-for-in */
/* eslint-disable prefer-const */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

const fs = require('fs');

const localizationFiles = [];
let index = 0;

// Define mainLanguage as English
const mainLanguage = 'gb';

getLocalizationFiles = () => {
  // Reads all files in localization files and save them in localizationFiles array
  fs.readdirSync('././src/localization/').forEach(file => {
    // Filter to only use get JSON files
    if (file.split('.').pop() === 'json') {
      const fileName = require(`../src/localization/${file}`);
      localizationFiles.push(fileName);
      localizationFiles[index].name = file.replace('.json', '');
      index += 1;
    }
  });
};

// Gets the language entered by the User (fr, la, gil, tl)
getSelectedLanguage = () => process.argv[2];

generateCsvData = (mainLanguage, selectedLanguage) => {
  let valueFound = false;
  // csvFileData keeps all the data coming from the json files
  let csvData = '';

  // Goes through all localization files
  localizationFiles.map(localizationFile => {
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
          mainLanguageValue = mainLanguageValue
            .replace(/\n/gi, '{nextLine}')
            .replace(/[\"]/gi, '{emptySpace}');
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
                .replace(/\n/gi, '{nextLine}')
                .replace(/[\"]/gi, '{emptySpace}');
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
    // Iterates over mainLanguageKeys to save the data of every localizationFile
    for (mainLanguageKey in mainLanguageKeys) {
      csvData = `${csvData} ${localizationFile.name},${mainLanguageKeys[mainLanguageKey]},"${mainLanguageValues[mainLanguageKey]}","${selectedLanguageValues[mainLanguageKey]}"\n`;
    }
  });
  return csvData;
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

executeExportTranslation = () => {
  getLocalizationFiles();
  const selectedLanguage = getSelectedLanguage();
  const csvData = generateCsvData(mainLanguage, selectedLanguage);
  writeCsvFile(selectedLanguage, csvData);
};

executeExportTranslation();
