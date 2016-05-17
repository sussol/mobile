import {
  authenticateAsync,
  hashPassword,
 } from './authenticationUtils';

const AUTH_ENDPOINT = '/mobile/user'; // TODO Replace with real URL

export default class SyncAuthenticator {
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
}
