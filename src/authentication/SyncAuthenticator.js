import {
  authenticateAsync,
  getAuthHeader,
  hashPassword,
 } from './authenticationUtils';

const AUTH_ENDPOINT = '/mobile/user'; // TODO Replace with real URL

export class SyncAuthenticator {
  constructor(database) {
    this.database = database;
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
  authenticate(serverURL, username, password) {
    return new Promise((resolve, reject) => {
      if (serverURL.length === 0) reject('Enter a server URL');
      if (username.length === 0) reject('Enter the sync site username');
      if (password.length === 0) reject('Enter the sync site password');

      // Hash the password
      const passwordHash = hashPassword(password);

      const authURL = `${serverURL}${AUTH_ENDPOINT}`;

      authenticateAsync(authURL, username, passwordHash)
        .then(() => { // Valid, save in local db
          this.database.write(() => {
            this.database.update('Setting', {
              key: 'ServerURL',
              value: serverURL,
            });
            this.database.update('Setting', {
              key: 'SyncSiteName',
              value: username,
            });
            this.database.update('Setting', {
              key: 'SyncSitePasswordHash',
              value: passwordHash,
            });
          });
          resolve();
        }, (error) => reject(error) // Pass error up
      );
    });
  }

  /**
   * Returns the basic base64 encoded authorization header value for this sync site
   * @return {string} Authorization header value
   */
  getAuthHeader() {
    const settings = this.database.objects('Setting');
    const usernameResult = settings.filtered('SyncSiteName');
    const username = usernameResult ? usernameResult[0] : '';
    const passwordResult = settings.filtered('SyncSitePasswordHash');
    const password = passwordResult ? passwordResult[0] : '';
    return getAuthHeader(username, password);
  }
}
