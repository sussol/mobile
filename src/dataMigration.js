import packageJson from '../package.json';
import compareVersions from 'semver-compare';
import { SETTINGS_KEYS } from './settings';

export function migrateDataToVersion(database, settings) {
  let fromVersion = settings.get(SETTINGS_KEYS.APP_VERSION);
  if (!fromVersion || fromVersion.length === 0) fromVersion = '0.0.0';
  const toVersion = packageJson.version;
  if (fromVersion === toVersion) return; // Don't do anything if the version has not changed
  if (compareVersions(fromVersion, '1.0.30') < 0) {
    // 1.0.30 added the setting 'SYNC_IS_INITIALISED', where it previously relied on the 'SYNC_URL'
    const syncURL = settings.get(SETTINGS_KEYS.SYNC_URL);
    if (syncURL && syncURL.length > 0) settings.set(SETTINGS_KEYS.SYNC_IS_INITIALISED, 'true');
  }
  settings.set(SETTINGS_KEYS.APP_VERSION, toVersion);
}
