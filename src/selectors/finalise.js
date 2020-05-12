/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const selectFinaliseItemIsFinalised = ({ finalise }) => {
  const { finaliseItem } = finalise;
  const { isFinalised = false } = finaliseItem ?? {};
  return isFinalised;
};

export const selectFinaliseItem = ({ finalise }) => {
  const { finaliseItem } = finalise;
  return finaliseItem;
};

export const selectCanFinalise = state => {
  const finaliseItem = selectFinaliseItem(state);
  const { canFinalise } = finaliseItem ?? {};
  const { success = false } = canFinalise ?? {};

  return success;
};

export const selectFinaliseMessage = state => {
  const finaliseItem = selectFinaliseItem(state);
  const { canFinalise } = finaliseItem ?? {};
  const { message = '' } = canFinalise ?? {};

  return message;
};
