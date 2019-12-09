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

const localizationFiles = [];
let index = 0;
require('fs')
  .readdirSync('././src/localization/')
  .forEach(file => {
    if (file.split('.').pop() === 'json') {
      const fileName = require(`../src/localization/${file}`);
      localizationFiles.push(fileName);
      localizationFiles[index].name = file.replace('.json', '');
      index += 1;
    }
  });

// get the third command line argument
const language = process.argv[2];

// read the file chosen by the user
const fileContent = fs.readFileSync(`./src/localization/translations/${language}.csv`, 'utf8');

// it creates one string per line in arrayOfData
const arrayOfData = fileContent.toString().split('\n');

let localizationFileName = [];
const keys = [];
const values = [];
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

  const resultObject = {};
  keys.forEach((key, value) => (resultObject[key] = values[value]));
  // update the correct object in the localization file
  localizationFile[language] = resultObject;

  keys.length = 0;
  values.length = 0;

  const fileName = localizationFile.name;
  delete localizationFile.name;

  // save changes in each localization file (authStrings, buttonStrings, etc)
  localizationFile = JSON.stringify(localizationFile, null, 2);
  fs.writeFile(`./src/localization/${fileName}.json`, localizationFile, err => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`The file ${fileName}.json has been saved`);
  });
}
