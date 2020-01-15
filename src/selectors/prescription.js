/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const selectHasItemsAndQuantity = ({ prescription }) => {
  const { transaction } = prescription;
  const { totalQuantity, items } = transaction;
  const hasItems = items.length > 0;
  const hasQuantity = totalQuantity > 0;
  return hasItems && hasQuantity;
};

export const selectPrescriptionPatient = ({ prescription }) => {
  const { transaction } = prescription;
  const { otherParty } = transaction;
  return otherParty;
};

export const selectPrescriptionPrescriber = ({ prescription }) => {
  const { transaction } = prescription;
  const { prescriber } = transaction;
  return prescriber;
};
