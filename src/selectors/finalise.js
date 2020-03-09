/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const selectFinaliseItemIsFinalised = ({ finalise }) => {
  const { finaliseItem } = finalise;
  const { isFinalised = false } = finaliseItem ?? {};
  return isFinalised;
};
