/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const selectCurrentUser = ({ user }) => {
  const { currentUser = {} } = user;
  return currentUser;
};

export const selectCurrentUserPermissions = ({ user }) => {
  const { currentUser } = user;
  const { permissions = {} } = currentUser ?? {};
  return permissions;
};

export const selectCurrentUserIsAdmin = ({ user }) => {
  const { currentUser } = user;
  const { isAdmin = false } = currentUser ?? {};
  return isAdmin;
};

export const selectHideStocktakeSnapshotQuantity = ({ user }) => {
  const { currentUser } = user;
  const { showStocktakeCurrentQuantity = true } = currentUser ?? {};
  return !showStocktakeCurrentQuantity;
};

export const selectCurrentUserPasswordHash = ({ user }) => {
  const { currentUser } = user;
  const { passwordHash = '' } = currentUser ?? {};
  return passwordHash;
};
