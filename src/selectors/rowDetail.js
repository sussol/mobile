/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const selectRowDetailIsOpen = ({ rowDetail }) => {
  const { detailKey } = rowDetail;
  return !!detailKey;
};
