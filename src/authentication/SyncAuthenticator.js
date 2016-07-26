import {
  authenticateAsync,
  getAuthHeader,
  hashPassword,
 } from './authenticationUtils';

import { SETTINGS_KEYS } from '../settings';
const {
   SUPPLYING_STORE_ID,
   SUPPLYING_STORE_NAME_ID,
   SYNC_URL,
   SYNC_SERVER_ID,
   SYNC_SITE_ID,
   SYNC_SITE_NAME,
   SYNC_SITE_PASSWORD_HASH,
   THIS_STORE_ID,
   THIS_STORE_NAME_ID,
 } = SETTINGS_KEYS;

const AUTH_ENDPOINT = '/sync/v2/site';

export class SyncAuthenticator {
  constructor(database, settings) {
    this.database = database;
    this.settings = settings;
  }

/**
 * Check whether the username and password are valid, against the server. On
 * successful authentication, save the details in the database.
 * @param  {string}   username         The sync site username to test
 * @param  {string}   password         The password to test
 * @param  {function} onAuthentication The function to call on authentication, with
 *                                     a boolean parameter representing success, and
 *                                     any error message as a second parameter
 * @return {none}
 */
  async authenticate(serverURL, username, password) {
    if (serverURL.length === 0) throw new Error('Enter a server URL');
    if (username.length === 0) throw new Error('Enter the sync site username');
    if (password.length === 0) throw new Error('Enter the sync site password');

    // Hash the password
    const passwordHash = hashPassword(password);

    const authURL = `${serverURL}${AUTH_ENDPOINT}`;

    try {
      const responseJson = await authenticateAsync(authURL, username, passwordHash);
      this.settings.set(SYNC_URL, serverURL);
      this.settings.set(SYNC_SITE_NAME, username);
      this.settings.set(SYNC_SITE_PASSWORD_HASH, passwordHash);
      this.settings.set(SYNC_SERVER_ID, responseJson.ServerID);
      this.settings.set(SYNC_SITE_ID, responseJson.SiteID);
      this.settings.set(THIS_STORE_ID, responseJson.StoreID);
      this.settings.set(THIS_STORE_NAME_ID, responseJson.NameID);
      this.settings.set(SUPPLYING_STORE_ID, responseJson.SupplyingStoreID);
      this.settings.set(SUPPLYING_STORE_NAME_ID, responseJson.SupplyingStoreNameID);
    } catch (error) { // Pass error up
      throw error;
    }
  }

  /**
   * Returns the basic base64 encoded authorization header value for this sync site
   * @return {string} Authorization header value
   */
  getAuthHeader() {
    const username = this.settings.get('SyncSiteName');
    const password = this.settings.get('SyncSitePasswordHash');
    return getAuthHeader(username, password);
  }
}
