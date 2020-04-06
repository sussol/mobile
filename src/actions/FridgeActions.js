/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const FRIDGE_ACTIONS = {
  SELECT: 'FridgeActions/select',
};

const select = fridge => ({ type: FRIDGE_ACTIONS.SELECT, payload: { fridge } });

export const FridgeActions = {
  select,
};
