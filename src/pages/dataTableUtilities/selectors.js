/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Selects a pageObject field from within the `pages` state.
 */
export const pageObjectSelector = state => {
  const { pages } = state;
  const { currentRoute } = pages;

  const pageState = pages[currentRoute];

  const { pageObject } = pageState;

  return pageObject;
};
