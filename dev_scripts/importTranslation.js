/* eslint-disable prettier/prettier */
/* eslint-disable no-useless-escape */
/* eslint-disable array-callback-return */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-return-assign */
/* eslint-disable no-shadow */
/* eslint-disable guard-for-in */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

const fs = require('fs');

const localizationFiles = [];
let localizationFileName = [];
const keys = [];
const values = [];
let key = null;
let value = null;
// To identify {nextLine} in the csv files
const nextLine = /{nextLine}/gi;
// To identify {emptySpace} in the csv files
const emptySpace = /{emptySpace}/gi;
let index = 0;

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

UpdateJsonFiles = selectedLanguage => {
  // read the file chosen by the user
  const fileContent = fs.readFileSync(
    `./src/localization/translations/${selectedLanguage}.csv`,
    'utf8'
  );

  // Creates one string per line available in the csv file
  const arrayOfData = fileContent.toString().split('\n');

  // Go through all localizationFiles
  localizationFiles.map(localizationFile => {
    arrayOfData.map((arrayOfData, indexOfArrayOfData) => {
      const data = JSON.stringify(arrayOfData)
        .replace(/"/g, '')
        .split(',');
      // [ key, value in english, value in other language ] of line i of whole csv file
      data[indexOfArrayOfData] = arrayOfData.split(',').slice(1);
      // authStrings, buttonStrings, etc.
      localizationFileName = arrayOfData
        .split(',')
        .slice(0)[0]
        .trim();
      if (localizationFile.name === localizationFileName) {
        key = data[indexOfArrayOfData][0];
        value = data[indexOfArrayOfData][2]
          .replace(nextLine, '\n')
          .replace(emptySpace, '\"')
          .trim();
        // Checks if the value in empty or there is some text to save
        if (value !== '') {
          keys.push(key);
          values.push(value);
        }
      }
    });
    const resultObject = {};
    keys.forEach((key, value) => (resultObject[key] = values[value]));
    // Updates strings related with the selectedLanguage in localizationFile
    localizationFile[selectedLanguage] = resultObject;
    // Cleans both arrays to be ready to use in next localizationFile
    keys.length = 0;
    values.length = 0;

    // Keeps the localizationFile name and removes the one added to localizationFile
    const fileName = localizationFile.name;
    delete localizationFile.name;

    // Updates localizationFile
    localizationFile = JSON.stringify(localizationFile, null, 2);
    fs.writeFile(`./src/localization/${fileName}.json`, localizationFile, err => {
      if (err) throw err;
      // eslint-disable-next-line no-console
      console.log(`The file ${fileName}.json has been saved`);
    });
  });
};

executeImportTranslation = () => {
  getLocalizationFiles();
  const selectedLanguage = getSelectedLanguage();
  UpdateJsonFiles(selectedLanguage);
};

executeImportTranslation();
