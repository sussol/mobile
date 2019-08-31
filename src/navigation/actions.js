import { NavigationActions } from 'react-navigation';
import { UIDatabase } from '../database';
import Settings from '../settings/MobileAppSettings';
import { createRecord } from '../database/utilities/index';
import { navStrings } from '../localization/index';
import { SETTINGS_KEYS } from '../settings/index';

export const gotoSupplierRequisition = requisition =>
  NavigationActions.navigate({
    routeName: 'supplierRequisition',
    params: {
      title: `${navStrings.requisition} ${requisition.serialNumber}`,
      requisition,
    },
  });

export const createSupplierRequisition = ({
  currentUser,
  ...requisitionParameters
}) => dispatch => {
  const customData = Settings.get(SETTINGS_KEYS.THIS_STORE_CUSTOM_DATA);

  const parsedCustomData = customData ? JSON.parse(customData) : '';

  const monthsLeadTime = parsedCustomData.monthsLeadTime
    ? Number(customData.monthsLeadTime.data)
    : 0;

  let requisition;
  UIDatabase.write(() => {
    requisition = createRecord(UIDatabase, 'Requisition', currentUser, {
      ...requisitionParameters,
      monthsLeadTime,
    });

    if (requisition.program) {
      requisition.addItemsFromProgram(UIDatabase);
    }
  });

  dispatch(gotoSupplierRequisition(requisition));
};
