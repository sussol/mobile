import { Settings } from './Settings';
import { SETTINGS_KEYS } from './index';
import { setCurrentLanguage, DEFAULT_LANGUAGE } from '../localization';

export class MobileAppSettings extends Settings {
  constructor(database) {
    super(database);
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

  // Calls any functions that need to be called (each time the app is started). Checks database
  // to see if there are any settings, if not calls setDefaults.
  load() {
    if (this.database.objects('Setting').length <= 0) this.setDefaults();
    setCurrentLanguage(this.get(SETTINGS_KEYS.CURRENT_LANGUAGE));
  }

  setDefaults() {
    this.set(SETTINGS_KEYS.CURRENT_LANGUAGE, DEFAULT_LANGUAGE);
  }
}
