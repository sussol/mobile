export function parsePositiveNumber(numberString) {
  if (!numberString || numberString.length < 1) return null;
  const number = parseFloat(numberString);
  if (isNaN(number)) return 0; // Invalid strings become 0
  return Math.max(number, 0); // Negative numbers become 0
}
