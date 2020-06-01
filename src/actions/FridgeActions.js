/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const FRIDGE_ACTIONS = {
  SELECT: 'FridgeActions/select',
  CHANGE_TO_DATE: 'FridgeActions/changeToDate',
  CHANGE_FROM_DATE: 'FridgeActions/changeFromDate',
};

const select = fridge => ({ type: FRIDGE_ACTIONS.SELECT, payload: { fridge } });
const changeToDate = date => ({ type: FRIDGE_ACTIONS.CHANGE_TO_DATE, payload: { date } });
const changeFromDate = date => ({ type: FRIDGE_ACTIONS.CHANGE_FROM_DATE, payload: { date } });

export const FridgeActions = {
  select,
  changeToDate,
  changeFromDate,
};
