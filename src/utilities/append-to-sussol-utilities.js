export function parsePositiveFloat(numberString) {
  if (!numberString || numberString.length < 1) return null;
  const number = parseFloat(numberString);
  if (isNaN(number)) return 0; // Invalid strings become 0
  return number; // Negative numbers become 0
}
export function formatExpiryDate(date) {
  if (!date) return '';

  let month = (date.getMonth() + 1).toString();
  month = month.length === 1 ? `0${month}` : month;
  return `${month}/${date.getFullYear()}`;
}
export function parseExpiryDate(date) {
  if (!date) return null;

  const parts = date.split('/');
  if (parts.length !== 2) return null;

  const month = parseInt(parts[0], 10);
  if (isNaN(month) || month < 1 || month > 12) return null;

  if (parts[1].length > 4 || parts[1].length === 0) return null;
  const year = parseInt(formatToFullYear(parts[1]), 10);
  if (isNaN(year)) return null;
  // Date object takes months starting with zero, our month will be + 1
  // So next month, day zero is previous month last day
  // for 12th month, will parse to 0 day of next year which will be last day
  // of previous year
  const returnDate = new Date();
  returnDate.setFullYear(year, month, 0);
  return returnDate;
}
function formatToFullYear(yearString) {
  const addOn = '200'.substring(0, 4 - yearString.length);
  return `${addOn}${yearString}`;
}
