/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const selectCurrentPrescriber = ({ prescriber }) => {
  const { currentPrescriber } = prescriber;
  return currentPrescriber;
};

export const selectPrescriberName = ({ prescriber }) => {
  const currentPrescriber = selectCurrentPrescriber({ prescriber });
  return `${currentPrescriber?.firstName} ${currentPrescriber?.lastName}`.trim();
};
