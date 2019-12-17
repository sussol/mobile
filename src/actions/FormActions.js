/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const FORM_ACTIONS = {
  INITIALISE: 'Form/Initialise',
  UPDATE: 'Form/Update',
  CANCEL: 'Form/Cancel',
};

const initialiseForm = config => ({ type: FORM_ACTIONS.INITIALISE, payload: { config } });

export const FormActions = { initialiseForm };
