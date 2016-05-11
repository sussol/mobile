import Base64 from 'base-64';
import authenticationUtils from './authenticationUtils';

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
 * @param  {string}   username  The username to test
 * @param  {string}   password  The password to test
 * @param  {function} onSuccess The function to call on successful
 *                              authentication
 * @param  {function} onFailure The function to call if there is an error, with
 *                              the errror message as a parameter
 * @return {none}
 */
  authenticate(username, password, onSuccess, onFailure) {
    if (!username | !password) { // Missing username or password, return early
      onFailure('Enter a username and password');
      return;
    }

    this.activeUsername = username;
    this.activePassword = password;

    const passwordHash = authenticationUtils.hashPassword(password);
    const serverURL = this.database.objects('Setting').filtered('key = "ServerURL"')[0].value;
    const authURL = `${serverURL}/mobile/user`;

    // Get the cached user from the database, if they exist
    const user = this.database.objects('User').filtered(`username = "${username}"`)[0];
    fetch(authURL, {
      headers: {
        Authorization: `Basic ${Base64.encode(`${username}:${passwordHash}`)}`,
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.id && !responseJson.error) { // Valid, save in local db
        this.database.write(() => {
          this.database.create('User', {
            id: responseJson.id,
            username: username,
            passwordHash: passwordHash,
          }, true);
        });
        onSuccess();
      } else { // Username/password invalid, clear from local db if it exists
        if (user && user.passwordHash === passwordHash) {
          this.database.write(() => {
            user.passwordHash = '';
          });
        }
        onFailure('Invalid username or password');
      }
    })
    .catch(() => { // Error with connection, check against local database
      if (user && user.passwordHash && user.passwordHash === passwordHash) onSuccess();
      else onFailure('Unable to connect and username/password not cached.');
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
    this.authenticate(
      this.activeUsername,
      this.activePassword,
      () => onAuthentication(true),
      () => onAuthentication(false)
    );
  }
}
