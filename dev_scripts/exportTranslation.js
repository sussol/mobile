/* eslint-disable default-case */
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

// Define mainLanguage as English (gb)
const mainLanguage = 'gb';

getLocalizationFiles = () => {
  // Reads all files in localization files and save them in localizationFiles array
  fs.readdirSync('././src/localization/').forEach(file => {
    // Filter to only get JSON files
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
  // csvFileData keeps all the data stored in json files
  let csvData = '';
  // Goes through all localization files
  localizationFiles.map(localizationFile => {
    const mainLanguageKeys = [];
    const mainLanguageValues = [];
    const selectedLanguageValues = [];
    // Iterates over every language
    for (const [language, mainLanguageKey] of Object.entries(localizationFile)) {
      switch (language) {
        case mainLanguage:
          // Saves all mainLanguageValues
          for (let [mainLanguageKeyAgain, mainLanguageValue] of Object.entries(mainLanguageKey)) {
            mainLanguageKeys.push(mainLanguageKeyAgain);
            mainLanguageValue = mainLanguageValue
              .replace(/\n/gi, '{nextLine}')
              .replace(/[\"]/gi, '{emptySpace}');
            mainLanguageValues.push(mainLanguageValue);
          }
          break;
        case selectedLanguage:
          // Uses mainLanguageKeys array to iterates over the selectedLanguage
          for (selectedLanguageKey of mainLanguageKeys) {
            valueFound = false;
            // Saves all the selectedLanguage data in selectedLanguageValues
            for (let [selectedLanguageKeyAgain, selectedLanguageValue] of Object.entries(
              mainLanguageKey
            )) {
              if (selectedLanguageKey === selectedLanguageKeyAgain && !valueFound) {
                selectedLanguageValue = selectedLanguageValue
                  .replace(/\n/gi, '{nextLine}')
                  .replace(/[\"]/gi, '{emptySpace}');
                selectedLanguageValues.push(selectedLanguageValue);
                // Stops searching the selectedLanguageKey if found
                valueFound = true;
              }
            }
            if (!valueFound) {
              // Key an empty value when SelectedLanguageValue is not found
              selectedLanguageValues.push('');
              valueFound = false;
            }
          }
          break;
      }
    }
    // Updates (Adds more data) to csvData
    mainLanguageKeys.map((mainLanguageKey, mainLanguageKeyIndex) => {
      csvData = `${csvData} ${localizationFile.name},${mainLanguageKey},"${mainLanguageValues[mainLanguageKeyIndex]}","${selectedLanguageValues[mainLanguageKeyIndex]}"\n`;
    });
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

getLocalizationFiles();
const selectedLanguage = getSelectedLanguage();
const csvData = generateCsvData(mainLanguage, selectedLanguage);
writeCsvFile(selectedLanguage, csvData);
