/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

const fs = require('fs');

const localizationFiles = [];
const nextLine = /{nextLine}/g;
const selectedLanguage = process.argv[3];
const newFileFolder = './src/localization/translations/';
const message =
  '\nMore information about this script here: https://github.com/openmsupply/mobile/wiki/Scripts\n';

// Reads all JSON files in localization files and save them in localizationFiles array
const filesFolder = './src/localization/';
fs.readdirSync(`./${filesFolder}`).forEach(file => {
  if (file.split('.').pop() === 'json') {
    localizationFiles.push({
      fileContent: require(`../${filesFolder}${file}`),
      fileName: file.replace('.json', ''),
    });
  }
});

// Exports all strings from the selectedLanguage to CSV
// csvData keeps all the content in csv formal
const exportTranslation = () => {
  let csvData = '';
  localizationFiles.forEach(localizationFile => {
    const valuesObject = {};
    const selectedValuesObject = {};
    Object.entries(localizationFile.fileContent.gb).forEach(([key, value]) => {
      valuesObject[key] = value.replace(/\n/gi, '{nextLine}');
      selectedValuesObject[key] = localizationFile.fileContent[selectedLanguage][key]
        ? localizationFile.fileContent[selectedLanguage][key].replace(/\n/gi, '{nextLine}')
        : '';
      csvData = `${csvData} ${localizationFile.fileName},${key},"${valuesObject[key]}","${selectedValuesObject[key]}"\n`;
    });
  });
  fs.writeFile(`${newFileFolder}${selectedLanguage}.csv`, csvData, 'utf8', err => {
    if (err) {
      console.log('Error - file either not saved or corrupted file saved.');
    } else {
      console.log(`\nFile ${newFileFolder}${selectedLanguage}.csv saved.${message}`);
    }
  });
};

// Imports all data from TSV file and save it in its corresponding localization file
const importTranslation = () => {
  const csvObject = {};
  const file = fs.readFileSync(`${newFileFolder}${selectedLanguage}.tsv`, 'utf8');

  // Creates one string per line available in the csv file
  const csvRows = file.toString().split('\n');

  // Reads row by row in the TSV file
  csvRows.forEach(csvRow => {
    const [fileName, translationField, generalValue, selectedValue] = csvRow.split('\t');
    const trimmedFileName = fileName.trim();
    if (!csvObject[trimmedFileName]) csvObject[trimmedFileName] = {};
    if (!selectedValue) return;
    const trimmedSelectedValue = selectedValue.trim();
    if (trimmedSelectedValue) csvObject[trimmedFileName][translationField] = trimmedSelectedValue;
  });

  localizationFiles.forEach(localizationFile => {
    const { fileContent, fileName } = localizationFile;
    const newObject = {};
    Object.entries(fileContent.gb).forEach(([key]) => {
      if (csvObject[fileName][key]) {
        newObject[key] = csvObject[fileName][key].replace(nextLine, '\n');
      } else if (fileContent[selectedLanguage] && fileContent[selectedLanguage][key]) {
        newObject[key] = fileContent[selectedLanguage][key].replace(nextLine, '\n');
      }
    });
    fileContent[selectedLanguage] = newObject;
    const fileContentStringify = JSON.stringify(fileContent, null, 2);

    // Updates each file based on changes
    fs.writeFile(`${filesFolder}${fileName}.json`, `${fileContentStringify}\r\n`, err => {
      if (err) throw err;
      console.log(`The file ${filesFolder}${fileName}.json has been saved`);
    });
  });
  console.log(`${message}`);
};

// Gets the selected language from the command line (fr, la, gil, tl)
const translationScript = process.argv[2];
if (translationScript === 'export') exportTranslation();
else if (translationScript === 'import') importTranslation();
else console.log('Please enter a valid script');
