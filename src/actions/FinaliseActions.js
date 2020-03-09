/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const FINALISE_ACTIONS = {
  OPEN_MODAL: 'Finalise/openModal',
  CLOSE_MODAL: 'Finalise/closeModal',
  SET_FINALISE_ITEM: 'Finalise/setFinaliseItem',
};

const openModal = () => ({ type: FINALISE_ACTIONS.OPEN_MODAL });
const closeModal = () => ({ type: FINALISE_ACTIONS.CLOSE_MODAL });
const setFinaliseItem = finaliseItem => ({
  type: FINALISE_ACTIONS.SET_FINALISE_ITEM,
  payload: { finaliseItem },
});

export const FinaliseActions = { openModal, closeModal, setFinaliseItem };
