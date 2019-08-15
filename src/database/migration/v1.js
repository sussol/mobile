import { SETTINGS_KEYS } from '../../settings';

/**
 * 1.0.30: Added the setting 'SYNC_IS_INITIALISED'. Previously relied on 'SYNC_URL'.
 */

const v1Migrations = [
  {
    version: '1.0.30',
    migrate: (database, settings) => {
      const syncURL = settings.get(SETTINGS_KEYS.SYNC_URL);
      if (syncURL && syncURL.length > 0) {
        settings.set(SETTINGS_KEYS.SYNC_IS_INITIALISED, 'true');
      }
    },
  },
];

export default v1Migrations;
