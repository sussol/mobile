/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const selectCanSaveForm = ({ form }) => {
  const areAllValid = Object.values(form).every(({ isValid }) => isValid);
  const allHaveValues = Object.values(form).every(({ hasValue }) => hasValue);

  return areAllValid && allHaveValues;
};

export const selectCompletedForm = ({ form }) => {
  const canSaveForm = selectCanSaveForm({ form });
  if (!canSaveForm) return null;

  return Object.keys(form).reduce(
    (acc, formField) => ({ ...acc, [formField]: form[formField].value }),
    {}
  );
};
