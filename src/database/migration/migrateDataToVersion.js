/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { AsyncStorage } from 'react-native';

import { compareVersions } from '../../utilities';
import { SETTINGS_KEYS } from '../../settings';
import packageJson from '../../../package.json';
import v1Migrations from './v1';
import v2Migrations from './v2';

const APP_VERSION_KEY = 'AppVersion';
const dataMigrations = [...v1Migrations, ...v2Migrations];

export const migrateDataToVersion = async (database, settings) => {
  // Get current app version.
  let fromVersion;
  try {
    // First check for the old app version in local storage.
    fromVersion = await AsyncStorage.getItem(APP_VERSION_KEY);
  } catch (error) {
    // Silently ignore local storage errors.
  }
  // If app version not correctly retrieved from local storage, check settings.
  if (!fromVersion || fromVersion.length === 0) {
    fromVersion = settings.get(SETTINGS_KEYS.APP_VERSION);
    // Migrate app version from settings to local storage.
    AsyncStorage.setItem(APP_VERSION_KEY, fromVersion);
    settings.delete(SETTINGS_KEYS.APP_VERSION);
  }

  // Get upgraded version.
  const toVersion = packageJson.version;

  // If version was in neither local storage or settings, app instance is a new install,
  // no need to migrate.
  if (fromVersion && fromVersion.length !== 0) {
    // If version is latest, don't do anything.
    if (fromVersion === toVersion) return;
    // Do any required version update data migrations.
    // eslint-disable-next-line no-restricted-syntax
    for (const migration of dataMigrations) {
      if (
        compareVersions(fromVersion, migration.version) < 0 &&
        compareVersions(toVersion, migration.version) >= 0
      ) {
        migration.migrate(database, settings);
      }
    }
  }
  // Record the new app version.
  AsyncStorage.setItem(APP_VERSION_KEY, toVersion);
};

export default migrateDataToVersion;
