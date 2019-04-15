import { tableStrings } from '../localization';

export const formatStatus = status => {
  switch (status) {
    case 'finalised':
      return tableStrings.finalised;
    default:
      return tableStrings.in_progress;
  }
};

export const formatExposureRange = ({ min, max } = {}) => {
  if (!(min && max)) return '';
  const degree = String.fromCharCode(176);
  return `${min}${degree}C to ${max}${degree}C`;
};
