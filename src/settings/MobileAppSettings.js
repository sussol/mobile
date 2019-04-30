import { Settings } from 'react-native-database';

import DeviceInfo from 'react-native-device-info';

import { SETTINGS_KEYS } from './index';
import { setCurrentLanguage, DEFAULT_LANGUAGE } from '../localization';

export class MobileAppSettings extends Settings {
  constructor(database) {
    super(database);
    this.load();
    this.set(SETTINGS_KEYS.HARDWARE_UUID, DeviceInfo.getUniqueID());
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
