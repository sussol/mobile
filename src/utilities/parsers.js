export function parsePositiveNumber(numberString) {
  if (!numberString || numberString.length < 1) return null;
  try {
    return Math.max(parseFloat(numberString), 0); // Negative numbers become 0
  } catch (error) {
    throw error;
  }
}
