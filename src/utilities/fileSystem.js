/* eslint-disable import/prefer-default-export */
import RNFS from 'react-native-fs';

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
