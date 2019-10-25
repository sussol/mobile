import AsyncStorage from '@react-native-community/async-storage';
import PropTypes from 'prop-types';

export const SETTINGS_KEYS = {
  APP_VERSION: 'AppVersion',
  CURRENT_LANGUAGE: 'CurrentLanguage',
  MOST_RECENT_USERNAME: 'MostRecentUsername',
  SUPPLYING_STORE_ID: 'SupplyingStoreId',
  SUPPLYING_STORE_NAME_ID: 'SupplyingStoreNameId',
  LAST_POST_PROCESSING_FAILED: 'LastPostProcessingFailed',
  SYNC_IS_INITIALISED: 'SyncIsInitialised',
  SYNC_PRIOR_FAILED: 'SyncPriorFailed',
  SYNC_URL: 'SyncURL',
  SYNC_SITE_ID: 'SyncSiteId',
  SYNC_SERVER_ID: 'SyncServerId',
  SYNC_SITE_NAME: 'SyncSiteName',
  SYNC_SITE_PASSWORD_HASH: 'SyncSitePasswordHash',
  THIS_STORE_ID: 'ThisStoreId',
  THIS_STORE_NAME_ID: 'ThisStoreNameId',
  THIS_STORE_TAGS: 'ThisStoreTags',
  THIS_STORE_CUSTOM_DATA: 'ThisStoreCustomData',
  HARDWARE_UUID: 'Hardware_UUID',
};

export const SETTINGS_TYPES = {
  APP_VERSION: PropTypes.string,
  CURRENT_LANGUAGE: PropTypes.string,
  MOST_RECENT_USERNAME: PropTypes.string,
  SUPPLYING_STORE_ID: PropTypes.string,
  SUPPLYING_STORE_NAME_ID: PropTypes.string,
  LAST_POST_PROCESSING_FAILED: PropTypes.bool,
  SYNC_IS_INITIALISED: PropTypes.bool,
  SYNC_PRIOR_FAILED: PropTypes.bool,
  SYNC_URL: PropTypes.string,
  SYNC_SITE_ID: PropTypes.string,
  SYNC_SERVER_ID: PropTypes.string,
  SYNC_SITE_NAME: PropTypes.string,
  SYNC_SITE_PASSWORD_HASH: PropTypes.string,
  THIS_STORE_ID: PropTypes.string,
  THIS_STORE_NAME_ID: PropTypes.string,
  THIS_STORE_TAGS: PropTypes.string,
  THIS_STORE_CUSTOM_DATA: PropTypes.object,
  HARDWARE_UUID: PropTypes.string,
};

export const getAppVersion = async () => {
  const appVersion = await AsyncStorage.getItem(SETTINGS_KEYS.APP_VERSION);
  return appVersion;
};
