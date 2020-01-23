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
