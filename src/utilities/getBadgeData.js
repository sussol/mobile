import { generalStrings } from '../localization';
import { UIDatabase } from '../database';

const routeList = {
  customerRequisitions: 'ResponseRequisition',
  supplierRequisitions: 'RequestRequisition',
  supplierInvoices: 'SupplierInvoice',
  stocktakes: 'Stocktake',
  customerInvoices: 'CustomerInvoice',
  vaccines: 'TemperatureBreach',
};

const getBadgeData = routeName => {
  const dataType = routeName in routeList ? routeList[routeName] : '';

  switch (dataType) {
    case 'TemperatureBreach':
      return [
        {
          count: dataType
            ? UIDatabase.objects(dataType).filtered('acknowledged == false').length
            : 0,
          title: `${generalStrings.unacknowledged} ${generalStrings[routeName]}`,
        },
      ];
    default:
      return [
        {
          count: dataType
            ? UIDatabase.objects(dataType).filtered('status != "finalised"').length
            : 0,
          title: `${generalStrings.unfinalised} ${generalStrings[routeName]}`,
        },
      ];
  }
};

export default getBadgeData;
export { getBadgeData };
