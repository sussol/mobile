/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Selects a the form state.
 * @return {Object}
 */
export const selectForm = ({ form }) => form?.formConfig ?? {};

/**
 * Selects a boolean from the form state which is an indicator
 * whether this form is in a valid and complete state.
 * @return {bool}
 */
export const selectCanSaveForm = ({ form }) => {
  const { formConfig } = form;
  return Object.values(formConfig).every(({ isValid }) => isValid);
};

/**
 * Selects an object from the current form state, if the form is in a compelete
 * and valid state, which is a simple key:value pairing of all fields and their
 * adjusted values of each input.
 *
 * @return {Object}
 */
export const selectCompletedForm = ({ form }) => {
  const { formConfig } = form;
  return Object.keys(formConfig).reduce(
    (acc, formField) => ({ ...acc, [formField]: formConfig[formField].value }),
    {}
  );
};

export const selectIsConfirmFormOpen = ({ form }) => {
  const { formState } = form;
  const { isConfirmFormOpen = false } = formState;
  return isConfirmFormOpen;
};
