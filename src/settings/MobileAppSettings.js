import { Settings } from 'react-native-database';

import { SETTINGS_KEYS } from './index';
import { DEFAULT_LANGUAGE } from '../localization/index';
import { setCurrentLanguage } from '../localization/utilities';
import { UIDatabase } from '../database';
import { setCurrencyLocalisation } from '../localization/currency';

class MobileAppSettings extends Settings {
  constructor() {
    super(UIDatabase);
    this.load();
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
    if (UIDatabase.objects('Setting').length <= 0) this.setDefaults();
    const currentLanguage = this.get(SETTINGS_KEYS.CURRENT_LANGUAGE);
    setCurrentLanguage(currentLanguage);
    setCurrencyLocalisation(currentLanguage);
  }

  setDefaults() {
    this.set(SETTINGS_KEYS.CURRENT_LANGUAGE, DEFAULT_LANGUAGE);
  }
}

export default new MobileAppSettings();
