/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const selectUsingSupplierCredits = ({ modules }) => {
  const { usingSupplierCredits } = modules;
  return usingSupplierCredits;
};

export const selectUsingPayments = ({ modules }) => {
  const { usingPayments } = modules;
  return usingPayments;
};

export const selectUsingPaymentTypes = ({ modules }) => {
  const { usingPaymentTypes } = modules;
  return usingPaymentTypes;
};

export const selectUsingPatientTypes = ({ modules }) => {
  const { usingPatientTypes } = modules;
  return usingPatientTypes;
};

export const selectUsingPrescriptionCategories = ({ modules }) => {
  const { usingPrescriptionCategories } = modules;
  return usingPrescriptionCategories;
};
