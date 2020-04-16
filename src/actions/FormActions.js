/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const FORM_ACTIONS = {
  INITIALISE: 'Form/Initialise',
  UPDATE: 'Form/Update',
  CANCEL: 'Form/Cancel',
  SHOW_CONFIRM_FORM: 'Form/ShowConfirmForm',
};

const initialiseForm = config => ({ type: FORM_ACTIONS.INITIALISE, payload: { config } });
const updateForm = (key, value) => ({ type: FORM_ACTIONS.UPDATE, payload: { key, value } });
const resetForm = () => ({ type: FORM_ACTIONS.CANCEL });
const showConfirmForm = () => ({ type: FORM_ACTIONS.SHOW_CONFIRM_FORM });

export const FormActions = { initialiseForm, updateForm, resetForm, showConfirmForm };
