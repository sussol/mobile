/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const FRIDGE_DETAIL_ACTIONS = {
  SELECT: 'FridgeDetailActions/select',
  CHANGE_TO_DATE: 'FridgeDetailActions/changeToDate',
  CHANGE_FROM_DATE: 'FridgeDetailActions/changeFromDate',
};

const changeToDate = date => ({ type: FRIDGE_DETAIL_ACTIONS.CHANGE_TO_DATE, payload: { date } });
const changeFromDate = date => ({
  type: FRIDGE_DETAIL_ACTIONS.CHANGE_FROM_DATE,
  payload: { date },
});

export const FridgeDetailActions = {
  changeToDate,
  changeFromDate,
};
