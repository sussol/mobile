export function formatDate(date, format) {
  if (!date || typeof date !== 'object') return null;
  switch (format) {
    default:
    case 'slashes':
      return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
    case 'dots':
      return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
  }
}

export function formatDateAndTime(date, format) {
  switch (format) {
    default:
    case 'slashes':
      return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ` +
             `${date.getHours()}:${date.getMinutes()}`;
    case 'dots':
      return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} ` +
             `${date.getHours()}:${date.getMinutes()}`;
  }
}
