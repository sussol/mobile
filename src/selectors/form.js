/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { createSelector } from 'reselect';

/**
 * Selects the form state.
 *
 * @return {Object}
 */
export const selectForm = ({ form }) => form ?? {};

/**
 * Selects the form config.
 *
 * @return {Object}
 */
export const selectFormConfig = createSelector([selectForm], form => form?.formConfig);

/**
 * Selects a boolean from the form state which is an indicator
 * whether this form is in a valid and complete state.
 *
 * @return {bool}
 */
export const selectCanSaveForm = createSelector([selectFormConfig], formConfig =>
  Object.values(formConfig).every(({ isValid }) => isValid)
);

/**
 * Selects an object from the current form state, if the form is in a compelete
 * and valid state, which is a simple key:value pairing of all fields and their
 * adjusted values of each input.
 *
 * @return {Object}
 */
export const selectCompletedForm = createSelector([selectFormConfig], formConfig =>
  Object.keys(formConfig).reduce(
    (acc, formField) => ({ ...acc, [formField]: formConfig[formField].value }),
    {}
  )
);

/**
 * Selects if confirm form is currently open.
 * @return {bool}
 */
export const selectIsConfirmFormOpen = createSelector([selectForm], form => {
  const { isConfirmFormOpen = false } = form;
  return isConfirmFormOpen;
});
