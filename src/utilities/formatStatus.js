import { tableStrings } from '../localization';

export const formatStatus = status => {
  switch (status) {
    case 'finalised':
      return tableStrings.finalised;
    default:
      return tableStrings.in_progress;
  }
};

export default formatStatus;
