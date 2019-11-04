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

export { routeList, getCurrentRouteName, getCurrentParams };
