import {
  authenticateAsync,
  AUTH_ERROR_CODES,
  hashPassword,
 } from './authenticationUtils';

const {
   CONNECTION_FAILURE,
   INVALID_PASSWORD,
 } = AUTH_ERROR_CODES;

const AUTH_ENDPOINT = '/mobile/user';

export default class UserAuthenticator {
  constructor(database) {
    this.database = database;
    this.activeUsername = '';
    this.activePassword = '';
  }

/**
 * Check whether the username and password are valid, against the server
 * if internet is available, otherwise against the local cache. On successful
 * authentication, save the details in the database.
 * @param  {string}   username         The username to test
 * @param  {string}   password         The password to test
 * @return {none}
 */
  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      if (username.length === 0) reject('Enter a username');
      if (password.length === 0) reject('Enter a password');

      this.activeUsername = username;
      this.activePassword = password;

      // Hash the password
      const passwordHash = hashPassword(password);

      // Get the cached user from the database, if they exist
      const user = this.database.objects('User').filtered(`username = "${username}"`)[0];

      // Get the HTTP endpoint to authenticate against
      const serverURLResult = this.database.objects('Setting').filtered('key = "ServerURL"')[0];
      if (!serverURLResult) { // No valid server URL configured, fail early
        reject('Server URL not configured');
        return;
      }
      const serverURL = serverURLResult.value;
      const authURL = `${serverURL}${AUTH_ENDPOINT}`;

      authenticateAsync(authURL, username, passwordHash)
        .then((userJson) => {
          if (userJson.id) { // Valid, save in local db
            this.database.write(() => {
              this.database.create('User', {
                id: userJson.id,
                username: username,
                passwordHash: passwordHash,
              }, true);
            });
            resolve();
          } else reject('Unexpected response from server');
        }, (error) => {
          if (error === CONNECTION_FAILURE) { // Error with connection, check against local database
            if (user && user.passwordHash && user.passwordHash === passwordHash) {
              resolve();
            } else reject('Unable to connect and username/password not cached.');
          } else if (error === INVALID_PASSWORD) { // Password not valid
            if (user && user.passwordHash === passwordHash) {
              // Clear invalid password from db, if saved
              this.database.write(() => {
                user.passwordHash = '';
              });
            }
            reject(error);
          } else reject(error); // Most likely an empty username or password
        });
    });
  }

/**
 * Check that the user's details are still valid
 * @param  {function} onAuthentication A callback function expecting a boolean
 *                                     parameter that represents the success or
 *                                     failure of reauthentication
 * @return {none}
 */
  reauthenticate(onAuthentication) {
    if (!this.activeUsername | !this.activePassword) onAuthentication(false);
    this.authenticate(this.activeUsername, this.activePassword)
      .then(() => onAuthentication(true),
      () => onAuthentication(false));
  }
}
