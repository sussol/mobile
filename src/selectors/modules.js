/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

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

export const selectUsingSupplierCreditCategories = ({ modules }) => {
  const { usingSupplierCreditCategories } = modules;
  return usingSupplierCreditCategories;
};

export const selectHideSnapshotColumn = ({ modules }) => {
  const { usingHideSnapshotColumn } = modules;
  return usingHideSnapshotColumn;
};

export const selectUsingVaccines = ({ modules }) => {
  const { usingVaccines } = modules;

  return usingVaccines;
};
