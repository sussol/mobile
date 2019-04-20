import { tableStrings } from '../localization';
// TODO: Localize exposure range.

export const formatStatus = status => {
  switch (status) {
    case 'finalised':
      return tableStrings.finalised;
    default:
      return tableStrings.in_progress;
  }
};

export const formatExposureRange = ({ minTemperature, maxTemperature } = {}) => {
  const undefinedProperties = !(minTemperature && maxTemperature);
  const infinityTemperatures = minTemperature === Infinity || maxTemperature === -Infinity;
  if (undefinedProperties || infinityTemperatures) return 'No temperatures recorded';
  const degree = String.fromCharCode(176);
  return `${minTemperature}${degree}C to ${maxTemperature}${degree}C`;
};

export const formattedDifferenceBetweenDates = ({ startDate, endDate }) => {
  if (!(startDate || endDate)) return 'Unavailable';
  const differenceInMs = new Date(endDate.getTime() - startDate.getTime()).getTime();

  const msPerMinute = 1000 * 60;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const numberOfDays = Math.floor(differenceInMs / msPerDay);
  const numberOfHours = Math.floor((differenceInMs - numberOfDays * msPerDay) / msPerHour);
  const numberOfMinutes = Math.floor((differenceInMs - numberOfHours * msPerHour) / msPerMinute);

  let formattedDifference = '';
  if (numberOfDays) formattedDifference += `${numberOfDays} Days `;
  if (numberOfHours) formattedDifference += `${numberOfHours} Hours `;
  if (numberOfMinutes) formattedDifference += `${numberOfMinutes} Minutes `;

  return formattedDifference;
};
