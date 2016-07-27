export function formatDate(date, format) {
  if (!date || typeof date !== 'object') return null;
  switch (format) {
    default:
    case 'slashes':
      return `${date.getDate()}/${getMonth(date)}/${date.getFullYear()}`;
    case 'dots':
      return `${date.getDate()}.${getMonth(date)}.${date.getFullYear()}`;
  }
}

function getMonth(date) {
  return date.getMonth() + 1; // Date.getMonth is 0 indexed
}

export function formatDateAndTime(date, format) {
  const time = date.toLocaleTimeString();
  return `${formatDate(date, format)} ${time.substring(0, time.length - 3)}`;
}

export function formatStatus(status) {
  switch (status) {
    case 'finalised':
      return 'Finalised';
    default:
      return 'In Progress';
  }
}

export function truncateString(string, maxLength) {
  if (string.length <= maxLength) return string;
  return `${string.substring(0, maxLength - 3)}...`;
}
