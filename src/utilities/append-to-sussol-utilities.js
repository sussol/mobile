export function parsePositiveDouble(numberString) {
  if (!numberString || numberString.length < 1) return null;
  var number = parseFloat(numberString);
  if (isNaN(number)) return 0; // Invalid strings become 0
  return number; // Negative numbers become 0
}
