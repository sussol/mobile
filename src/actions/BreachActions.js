/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const BREACH_ACTIONS = {
  OPEN_MODAL: 'breachActions/openModal',
  CLOSE_MODAL: 'breachActions/closeModal',
  SET_FRIDGE_BREACH: 'breachActions/setFridgeBreach',
  SET_BATCH_BREACH: 'breachActions/setBatchBreach',
  SET_BATCH: 'breachActions/setBatch',
};

const open = () => ({ type: BREACH_ACTIONS.OPEN_MODAL });
const close = () => ({ type: BREACH_ACTIONS.CLOSE_MODAL });

const setFridgeBreach = breachId => ({
  type: BREACH_ACTIONS.SET_FRIDGE_BREACH,
  payload: { breachId },
});

const setBatchBreach = (batch, breach) => ({
  type: BREACH_ACTIONS.SET_BATCH_BREACH,
  payload: { batch, breach },
});

const setBatch = batch => ({
  type: BREACH_ACTIONS.SET_BATCH,
  payload: { batch },
});

export const BreachActions = { open, close, setFridgeBreach, setBatchBreach, setBatch };
