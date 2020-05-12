import { generalStrings } from '../localization';
import { UIDatabase } from '../database';

const routeList = {
  customerRequisitions: 'ResponseRequisition',
  supplierRequisitions: 'RequestRequisition',
  supplierInvoices: 'SupplierInvoice',
  stocktakes: 'Stocktake',
  customerInvoices: 'CustomerInvoice',
};

const getBadgeData = routeName => {
  const dataType = routeName in routeList ? routeList[routeName] : '';

  return [
    {
      count: dataType ? UIDatabase.objects(dataType).filtered('status != "finalised"').length : 0,
      title: `${generalStrings.unfinalised} ${generalStrings[routeName]}`,
    },
  ];
};

export default getBadgeData;
export { getBadgeData };
