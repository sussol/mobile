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
