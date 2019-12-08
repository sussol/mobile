/* eslint-disable no-loop-func */
/* eslint-disable no-return-assign */
/* eslint-disable prefer-destructuring */
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

// get the third command line argument
const language = process.argv[2];

// read the file chosen by the user
const fileContent = fs.readFileSync(`./src/localization/translations/${language}.csv`, 'utf8');

// it creates one string per line in arrayOfData
const arrayOfData = fileContent.toString().split('\n');

let localizationFileName = [];
let keys = [];
let values = [];
let key;
let value;
const nextLine = /{nextLine}/gi;
const emptySpace = /{emptySpace}/gi;

for (localizationFile of localizationFiles) {
  for (indexOfArrayOfData in arrayOfData) {
    const data = JSON.stringify(arrayOfData[indexOfArrayOfData])
      .replace(/"/g, '')
      .split(',');

    // [ key, value in english, value in other language ] of line i of whole csv file
    data[indexOfArrayOfData] = arrayOfData[indexOfArrayOfData].split(',').slice(1);
    // authStrings, buttonStrings, etc.
    localizationFileName = arrayOfData[indexOfArrayOfData].split(',').slice(0)[0];

    if (localizationFile.name === localizationFileName) {
      key = data[indexOfArrayOfData][0];
      value = data[indexOfArrayOfData][2]
        .replace(nextLine, '\n')
        .replace(emptySpace, '"')
        .trim();
      // if there is a key and value related with it, push changes in keys and values
      if (value !== '') {
        keys.push(key);
        values.push(value);
      }
    }
  }

  let resultObject = {};
  keys.forEach((key, value) => (resultObject[key] = values[value]));
  // update the correct object in the localization file
  localizationFile[language] = resultObject;

  keys.length = 0;
  values.length = 0;

  let fileName = localizationFile.name;
  delete localizationFile.name;

  // save changes in each localization file (authStrings, buttonStrings, etc)
  localizationFile = JSON.stringify(localizationFile, null, 2);
  fs.writeFile(`./src/localization/${fileName}.json`, localizationFile, err => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`The file ${fileName}.json has been saved`);
  });
}
