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
  const time = date.toLocaleTimeString();
  return `${formatDate(date, format)} ${time.substring(0, time.length - 3)}`;
}
