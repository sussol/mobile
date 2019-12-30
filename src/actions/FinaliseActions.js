/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const FINALISE_ACTIONS = {
  OPEN_MODAL: 'Finalise/openModal',
  CLOSE_MODAL: 'Finalise/closeModal',
};

const openModal = () => ({ type: FINALISE_ACTIONS.OPEN_MODAL });
const closeModal = () => ({ type: FINALISE_ACTIONS.CLOSE_MODAL });

export const FinaliseActions = { openModal, closeModal };
