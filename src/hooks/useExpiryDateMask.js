/* eslint-disable import/prefer-default-export */
import { useState } from 'react';

/**
 * Simple custom hook which manages the state of input for an
 * expiry date in the form mm/yy[yy] such that the entered date
 * always stays valid.
 *
 * @param {String} initialState Initial state of the expiry date
 */
export const useExpiryDateMask = initialState => {
  const [date, setDate] = useState(initialState);

  const regexpLookup = {
    // if there is only one character - match only singular digit months, or zero.
    1: /[0-9]/,
    // Two characters match a singular month and forward slash, or singular month with
    // a zero prefix, or a double digit month.
    2: /((^[0][1-9]$)|(^1[012]$)|(^[1-9]\/$))/,
    // Three characters match a valid month (always prefixed with a zero, if singular)
    // with a forward slash.
    3: /(^[[^0](?!0)]\/$)|(^[0][1-9]\/$)|(^1[012]\/$)/,
    // Entering the year, allows any year
    4: /(^([[^0](?!0)]\/)|([0][1-9]\/)|(1[012]\/))\d{1}$/,
    5: /(^([[^0](?!0)]\/)|([0][1-9]\/)|(1[012]\/))\d{2}$/,
    6: /(^([[^0](?!0)]\/)|([0][1-9]\/)|(1[012]\/))\d{3}$/,
    7: /(^([[^0](?!0)]\/)|([0][1-9]\/)|(1[012]\/))\d{4}$/,
  };

  // Validates a new value being set as state. Either allows the new value, or rejects
  // it, setting the current value as state. Appends/prepends a 0 or / to values of
  // length two. Resets the state when backspacing into an inconsistent state. Only
  // allows values in the form MM-Y[YYY]
  const checkAndSetDate = value => {
    const { length: oldLength } = date;
    const { length: newLength } = value;

    // Helpers - prepend/append / or 0 for values in M/ or MM state.
    const adjustMonth = newValue => (newValue.endsWith('/') ? `0${newValue}` : `${newValue}/`);
    const testString = newValue => regexpLookup[newLength].test(newValue);

    if (newLength > 7) return null;
    if (newLength === 0) return setDate('');
    if (newLength < oldLength) return testString(value) ? setDate(value) : setDate('');
    if (newLength === 2) return testString(value) ? setDate(adjustMonth(value)) : setDate(date);
    return testString(value) ? setDate(value) : setDate(date);
  };

  // Finalises an expiry date to be in the format MM/YYYY if the user has entered
  // MM/Y MM/YY MM/YYY by placing a potentially incorrect year in the 20th century.
  const finaliseDate = () => {
    // If the expiry date isn't in at least the form MM/Y - reset.
    if (date.length < 4) return setDate('');

    const [month, year] = date.split('/');
    const prependedYear = `${'200'.substring(0, 4 - year.length)}${year}`;
    return setDate(`${month}/${prependedYear}`);
  };

  return [date, checkAndSetDate, finaliseDate];
};
