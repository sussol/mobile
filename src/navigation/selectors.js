/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
const routeList = {
  customerRequisitions: 'ResponseRequisition',
  supplierRequisitions: 'RequestRequisition',
  supplierInvoices: 'SupplierInvoice',
  stocktakes: 'Stocktake',
  customerInvoices: 'CustomerInvoice',
};

const getCurrentRouteName = state =>
  state.routes[state.index] ? state.routes[state.index].routeName : undefined;

const getCurrentParams = state =>
  state.routes[state.index] ? state.routes[state.index].params : undefined;

const prevRouteNameSelector = state => {
  const { nav } = state;
  const { routes } = nav;

  const numberOfRoutes = routes.length;
  const prevRouteIndex = numberOfRoutes > 1 ? numberOfRoutes - 2 : 0;
  const { routeName } = routes[prevRouteIndex];

  return routeName;
};

export { routeList, prevRouteNameSelector, getCurrentRouteName, getCurrentParams };
