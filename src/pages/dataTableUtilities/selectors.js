/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Selects the current routes state.
 */
export const pageStateSelector = state => {
  const { pages } = state;
  const { currentRoute } = pages;
  return pages[currentRoute];
};

/**
 * Selects a pageObject field from within the `pages` state.
 */
export const pageObjectSelector = state => {
  const pageState = pageStateSelector(state);
  const { pageObject } = pageState;
  return pageObject;
};
