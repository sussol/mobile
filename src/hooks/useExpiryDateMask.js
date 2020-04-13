/* eslint-disable import/prefer-default-export */
import { useState } from 'react';

/**
 * Simple custom hook which manages the state of input for an
 * expiry date in the form dd/mm/yy[yy] such that the entered date
 * always stays valid.
 *
 * @param {String} initialState Initial state of the expiry date
 */
export const useExpiryDateMask = initialState => {
  const [date, setDate] = useState(initialState);

  const regexpLookup = {
    // One character matches:
    // - a singular day.
    1: /[0-9]/,
    // Two characters match:
    // - a singular day and forward slash.
    // - a singular day with a zero prefix.
    // - a double digit day.
    2: /((^[1-9]\/)|(^[012][1-9])|(^[3][01]))$/,
    // Three characters match:
    // - a valid day, prepended with zero if singular, appended with a forward slash.
    3: /((^[012][1-9])|(^[3][01]))\/$/,
    // Four characters match:
    // - a valid day and singular month.
    4: /((^[012][1-9])|(^[3][01]))\/[0-9]$/,
    // Five characters match:
    // - a valid day and a singular month and forward slash.
    // - a valid day and a singular month with a zero prefix.
    // - a valid day and a double digit month.
    5: /((^[012][1-9])|(^[3][01]))\/(([1-9]\/)|([0][1-9])|([1][012]))$/,
    // Six characters match:
    // - a valid day and valid month, appended with a forward slash.
    6: /((^[012][1-9])|(^[3][01]))\/(([0][1-9])|([1][012]))\/$/,
    // Seven characters match:
    // - a valid day and valid month and a singular year.
    7: /((^[012][1-9])|(^[3][01]))\/(([0][1-9])|([1][012]))\/\d{1}$/,
    // Eight characters match:
    // - a valid day and valid month and a two digit year.
    8: /((^[012][1-9])|(^[3][01]))\/(([0][1-9])|([1][012]))\/\d{2}$/,
    // Nine characters match:
    // - a valid day and valid month and a three digit year.
    9: /((^[012][1-9])|(^[3][01]))\/(([0][1-9])|([1][012]))\/\d{3}$/,
    // Ten characters match:
    // - a valid day and valid month and a three digit year.
    10: /((^[012][1-9])|(^[3][01]))\/(([0][1-9])|([1][012]))\/\d{4}$/,
  };

  // Validates a new value being set as state. Either allows the new value, or rejects
  // it, setting the current value as state. Appends/prepends a 0 or / to values of
  // length two. Resets the state when backspacing into an inconsistent state. Only
  // allows values in the form DD/MM/Y[YYY]
  const checkAndSetDate = value => {
    const { length: oldLength } = date;
    const { length: newLength } = value;

    // Helpers - prepend/append / or 0 for values in D/, DD, M/ or MM state.
    const adjustDay = newValue => (newValue.endsWith('/') ? `0${newValue}` : `${newValue}/`);
    const adjustMonth = newValue => {
      const [day, month] = newValue.split('/');
      return newValue.endsWith('/') ? `${day}/0${month}/` : `${day}/${month}/`;
    };
    const testString = newValue => regexpLookup[newLength].test(newValue);

    if (newLength > 10) return null;
    if (newLength === 0) return setDate('');
    if (newLength < oldLength) return testString(value) ? setDate(value) : setDate('');
    if (newLength === 2) return testString(value) ? setDate(adjustDay(value)) : setDate(date);
    if (newLength === 5) return testString(value) ? setDate(adjustMonth(value)) : setDate(date);
    return testString(value) ? setDate(value) : setDate(date);
  };

  // Finalises an expiry date to be in the format DD/MM/YYYY.
  const finaliseDate = () => {
    // If the expiry date isn't in at least the form DD/MM/Y - reset.
    if (date.length < 7) return setDate('');

    const [day, month, year] = date.split('/');
    const prependedYear = `${'200'.substring(0, 4 - year.length)}${year}`;

    return setDate(`${day}/${month}/${prependedYear}`);
  };

  return [date, checkAndSetDate, finaliseDate];
};
