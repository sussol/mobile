/* eslint-disable import/prefer-default-export */
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';

const ERRORS = {
  ERROR_NO_SPACE: { code: 'ERROR_NO_SPACE', message: 'Not enough space on disk to export' },
  ERROR_NO_FILE: { code: 'ERROR_NO_FILE', message: 'Could not find a realm database' },
};

/**
 * Helper method to validate that a file exists and there is enough
 * space on disk to create a duplicate.
 * @param  {String} path  Path of the file to check
 * @return {Object} Object with the shape:
 * { success: true/false, error:}
 */
export async function backupValidation(path) {
  let validationResult = { success: true };
  try {
    // Fetch the size of the realm file.
    const { size } = await RNFS.stat(path);
    // Fetch the free space remaining on the device.
    const { freeSpace } = await RNFS.getFSInfo();
    // Ensure there is twice the amount of space required for copying the
    // realm file, to be certain
    if (freeSpace < size * 2) {
      const { ERROR_NO_SPACE } = ERRORS;
      validationResult = { success: false, ...ERROR_NO_SPACE };
    }
  } catch (error) {
    const { ERROR_NO_FILE } = ERRORS;
    validationResult = { success: false, ...ERROR_NO_FILE };
  }
  return validationResult;
}

/**
 * Displays an open document dialog box which allows the user to select
 * one or more files and returns their full path(s)
 * @param {object} options Document select options object having keys of
 * `{fileType`: `* | <file_extension>`,
 * `pick`: `single | multiple}`
 * @returns {string} Path of the selected document
 */
export async function selectDocument({ fileType = '*', pick = 'single' }) {
  let filePath = '';
  const choose = pick === 'multiple' ? 'pickMultiple' : 'pick';
  try {
    const { fileCopyUri, name } = await DocumentPicker[choose]({
      type: [DocumentPicker.types.allFiles],
      copyTo: 'cachesDirectory', // Need to copy file(s) after their selection to the somewhere
      // so that 'fileCopyUri' can return a valid location. For this case, app cache directory
    });
    const fileExtensionRegex = new RegExp(`\\.(${fileType})$`, 'g');
    // Check if file(s) exist of specific file type then only return their file path
    filePath = fileType !== '*' && !fileExtensionRegex.test(name) ? '' : fileCopyUri;
  } catch (error) {
    if (DocumentPicker.isCancel(error)) {
      // User cancelled the picker, exit any dialogs or menus and move on
    }
  }
  return filePath;
}
