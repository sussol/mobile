import packageJson from '../package.json';
import compareVersions from 'semver-compare';
import { SETTINGS_KEYS } from './settings';

export function migrateDataToVersion(database, settings) {
  // Get the current version we are upgrading from
  let fromVersion = settings.get(SETTINGS_KEYS.APP_VERSION);
  // If no is version saved, it is from an early version, which can be represented as 0.0.0
  if (!fromVersion || fromVersion.length === 0) fromVersion = '0.0.0';
  // Get the new version we are upgrading to
  const toVersion = packageJson.version;
  // If the version has not changed, we are not upgrading, so don't do anything
  if (fromVersion === toVersion) return;
  // Do any required version update data migrations
  for (const migration of dataMigrations) {
    if (compareVersions(fromVersion, migration.version) < 0 &&
        compareVersions(toVersion, migration.version) >= 0) {
      migration.migrate(database, settings);
    }
  }
  // Record the new app version
  settings.set(SETTINGS_KEYS.APP_VERSION, toVersion);
}

// All data migration functions should be kept in this array, in sequential order. Each migration
// needs a 'version' key, denoting the version that migration will migrate to, and a 'migrate' key,
// which is a function taking the database and the settings and performs the migration
const dataMigrations = [
  {
    version: '1.0.30',
    migrate: (database, settings) => {
      // 1.0.30 added the setting 'SYNC_IS_INITIALISED', where it previously relied on 'SYNC_URL'
      const syncURL = settings.get(SETTINGS_KEYS.SYNC_URL);
      if (syncURL && syncURL.length > 0) settings.set(SETTINGS_KEYS.SYNC_IS_INITIALISED, 'true');
    },
  },
];
