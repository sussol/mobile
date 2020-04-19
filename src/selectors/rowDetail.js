/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const selectRowDetailIsOpen = ({ rowDetail }) => {
  const { detailKey } = rowDetail;
  return !!detailKey;
};
