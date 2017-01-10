import { tableStrings } from '../localization';

export function formatStatus(status) {
  switch (status) {
    case 'finalised':
      return tableStrings.finalised;
    default:
      return tableStrings.in_progress;
  }
}
