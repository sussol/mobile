export default class UserAuthenticator {
  constructor(database) {
    this.database = database;
    const serverURL = this.database.objects('Setting').filtered('key = "ServerURL"')[0].value;
    this.authURL = `${serverURL}/mobile/user`;
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

    // Get the cached user from the database, if they exist
    const user = this.database.objects('User').filtered(`username = "${username}"`)[0];
    fetch(this.authURL, {
      headers: {
        Authorization: 'Basic U3Vzc29sOmthdGhtYW5kdTMxMg==',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.id && !responseJson.error) { // Valid, save in local db
        this.database.write(() => {
          this.database.create('User', {
            id: responseJson.id,
            username: username,
            password: password,
          }, true);
        });
        onSuccess();
      } else { // Username/password invalid, clear from local db if it exists
        if (user && user.password === password) {
          this.database.write(() => {
            user.password = '';
          });
        }
        onFailure('Invalid username or password');
      }
    })
    .catch(() => { // Error with connection, check against local database
      if (user && user.password && user.password === password) onSuccess();
      else onFailure('Unable to connect and username/password not cached.');
    });
  }
}
