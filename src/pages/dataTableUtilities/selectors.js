/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const pageObjectSelector = state => {
  const { pages } = state;
  const { currentRoute } = pages;

  const pageState = pages[currentRoute];

  const { pageObject } = pageState;

  return pageObject;
};

export const pageStateSelector = state => {
  const { pages } = state;
  const { currentRoute } = pages;

  return pages[currentRoute];
};
