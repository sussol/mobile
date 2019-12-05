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

let language = '';

// read the language to be imported - entered by the user -
process.argv.forEach((val, index) => {
  if (index > 1) language = val;
});

// read the file chosen by the user
const fileContent = fs.readFileSync(`${language}.csv`, 'utf8');

// it creates one string per line in arrayOfData
const arrayOfData = fileContent.toString().split('\n');

let localizationFileName = [];
let keys = [];
let values = [];
let key;
let keyFound;
let value;
let valueFound;

for (fileIndex in localizationFiles) {
  for (indexOfArrayOfData in arrayOfData) {
    const data = JSON.stringify(arrayOfData[indexOfArrayOfData])
      .replace(/"/g, '')
      .split(',');

    // [ key, value in english, value in other language ] of line i of whole csv file
    data[indexOfArrayOfData] = arrayOfData[indexOfArrayOfData].split(':').slice(1);

    // authStrings, buttonStrings, etc.
    localizationFileName = arrayOfData[indexOfArrayOfData].replace(/[" ]/g, '').split(':')[0];
    if (localizationFiles[fileIndex].name === localizationFileName) {
      keyFound = false;
      valueFound = false;

      // checks key
      for (dataChar in data[indexOfArrayOfData][0]) {
        if (data[indexOfArrayOfData][0][dataChar] === ',' && !keyFound) {
          // find key -> create another function to do this
          key = data[indexOfArrayOfData][0].slice(0, dataChar);
          keyFound = true;
        } else if (data[indexOfArrayOfData][0][dataChar] === ',' && keyFound) {
          // find value -> create another function to do this
          value = data[indexOfArrayOfData][0]
            .slice(dataChar)
            .replace(/[,]/g, '')
            .trim();
          valueFound = true;
        }
      }
      // if there is a key and value related with it, push changes in keys and values
      if (keyFound && valueFound) {
        if (value !== '') {
          keys.push(key);
          values.push(value);
        }
      }
    }
  }
  // keep all obtained keys and values in an object
  let resultObject = {};
  keys.forEach((key, value) => (resultObject[key] = values[value]));
  // update the correct object in the localization file
  localizationFiles[fileIndex][language] = resultObject;

  // clean arrays keys and values to use it in next file
  keys = [];
  values = [];

  let fileName = localizationFiles[fileIndex].name;
  delete localizationFiles[fileIndex].name;

  // save changes in each localization file (authStrings, buttonStrings, etc)
  localizationFiles[fileIndex] = JSON.stringify(localizationFiles[fileIndex], null, 2);
  fs.writeFile(`./src/localization/${fileName}.json`, localizationFiles[fileIndex], err => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`The file ${fileName}.json has been saved`);
  });
}
