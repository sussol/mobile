/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Selects a boolean from the form state which is an indicator
 * whether this form is in a valid and complete state.
 * @return {bool}
 */
export const selectCanSaveForm = ({ form }) => {
  const allAreValid = Object.values(form).every(({ isValid }) => isValid);
  return allAreValid;
};

/**
 * Selects an object from the current form state, if the form is in a compelete
 * and valid state, which is a simple key:value pairing of all fields and their
 * adjusted values of each input.
 *
 * @return {Object}
 */
export const selectCompletedForm = ({ form }) => {
  const canSaveForm = selectCanSaveForm({ form });
  if (!canSaveForm) return null;

  return Object.keys(form).reduce(
    (acc, formField) => ({ ...acc, [formField]: form[formField].value }),
    {}
  );
};
