import { tableStrings } from '../localization';

export const formatStatus = status => {
  switch (status) {
    case 'finalised':
      return tableStrings.finalised;
    default:
      return tableStrings.in_progress;
  }
};

export const formatType = type => {
  switch (type) {
    case 'supplier_credit':
      return tableStrings.supplier_credit;
    case 'supplier_invoice':
      return tableStrings.supplier_invoice;
    case 'customer_credit':
      return tableStrings.customer_credit;
    case 'customer_invoice':
      return tableStrings.customer_invoice;
    default:
      return '';
  }
};

export default formatStatus;
