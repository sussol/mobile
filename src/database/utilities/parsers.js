/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

/**
 * Returns the boolean string as a boolean (false if none passed)
 *
 * @param  {string}  numberString  The string to convert to a boolean
 * @return {boolean}               The boolean representation of the string
 */
export const parseBoolean = booleanString => booleanString.toString().toLowerCase() === 'true';

/**
 * Return a Date object representing the given date, time.
 *
 * @param   {string}  ISODate  The date in ISO 8601 format.
 * @param   {string}  ISOTime  The time in ISO 8601 format. Optional.
 * @return  {Date}             The Date representing |ISODate| (and |ISOTime|).
 */
export const parseDate = (ISODate, ISOTime) => {
  if (
    !ISODate ||
    ISODate.length < 1 ||
    ISODate === '0000-00-00T00:00:00' ||
    ISODate === '0000-00-00T00:00:00Z'
  ) {
    return null;
  }
  const date = new Date(ISODate);
  if (ISOTime && ISOTime.length >= 6) {
    const hours = ISOTime.substring(0, 2);
    const minutes = ISOTime.substring(3, 5);
    const seconds = ISOTime.substring(6, 8);
    date.setHours(hours, minutes, seconds);
  }
  return date;
};

/**
 * Returns the number string as a float, or null if none passed.
 *
 * @param   {string}  numberString  The string to convert to a number.
 * @return  {float}                 The numeric representation of the string.
 */
export const parseNumber = numberString => {
  if (!numberString) return null;
  const result = parseFloat(numberString);
  return Number.isNaN(result) ? null : result;
};

/**
 * Returns jsonString prepared correctly for mobile realm database
 * @param  {string} jsonString The string to parse
 * @return {string}            The parsed string or |null|
 */
export const parseJsonString = jsonString => {
  // 4D adds extra backslashes, remove them so JSON.parse doesn't break
  let validatedString = jsonString && jsonString.replace(/\\/g, '');
  const nullValues = ['null', 'undefined'];
  // 'undefined' is stored as string on 4D, but as an optional field
  // in our realm schemas we can prefer |null|
  if (!validatedString || nullValues.includes(validatedString.toLowerCase())) {
    validatedString = null;
  }
  return validatedString;
};
