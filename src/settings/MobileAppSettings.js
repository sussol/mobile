import { Settings } from 'react-native-database';

import DeviceInfo from 'react-native-device-info';

import { SETTINGS_KEYS } from './index';
import { MILLISECONDS_PER_DAY } from '../database/utilities';
import { setCurrentLanguage, DEFAULT_LANGUAGE } from '../localization';

const DEFAULT_AMC_MONTHS_LOOKBAK = 3; // three months

export class MobileAppSettings extends Settings {
  constructor(database) {
    super(database);
    this.load();
    this.set(SETTINGS_KEYS.HARDWARE_UUID, DeviceInfo.getUniqueID());
    this.refreshGlobals();
  }

  set(key, value) {
    super.set(key, value);
    switch (key) {
      case SETTINGS_KEYS.CURRENT_LANGUAGE:
        setCurrentLanguage(value);
        break;
      default:
        break;
    }
  }

  refreshGlobals() {
    let customData = {};

    try {
      customData = JSON.parse(this.get(SETTINGS_KEYS.THIS_STORE_CUSTOM_DATA));
    } catch (e) {
      //
    }

    const {
      monthlyConsumptionLookBackPeriod: { data: AMCLookBackMonthsString } = {},
      monthlyConsumptionEnforceLookBackPeriod: { data: AMCenforceLookBackString } = {},
    } = customData;

    let AMCLookBackMonth = parseInt(AMCLookBackMonthsString, 10);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(AMCLookBackMonth) || AMCLookBackMonth <= 0) {
      AMCLookBackMonth = DEFAULT_AMC_MONTHS_LOOKBAK;
    }

    global.AMCmillisecondsLookBack = AMCLookBackMonth * 30 * MILLISECONDS_PER_DAY;
    global.AMCenforceLookBack = AMCenforceLookBackString === 'true';
  }

  // Call functions for initialising the app on start. Checks database for any
  // settings. If no settings found, calls |setDefaults()|.
  load() {
    if (this.database.objects('Setting').length <= 0) this.setDefaults();
    setCurrentLanguage(this.get(SETTINGS_KEYS.CURRENT_LANGUAGE));
  }

  setDefaults() {
    this.set(SETTINGS_KEYS.CURRENT_LANGUAGE, DEFAULT_LANGUAGE);
  }
}

export default MobileAppSettings;
