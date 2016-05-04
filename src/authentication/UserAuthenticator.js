import React from 'react-native';

export default class UserAuthenticator {
  constructor(database) {
    this.database = database;
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
    fetch('http://jsonplaceholder.typicode.com/users/1')
    .then((response) => response.text())
    .then((responseText) => {
      onFailure(responseText);
    })
    .catch((error) => {
      onFailure(error.message);
    });
    // Check if internet connection is available
      // Authenticate against HTTP server
      // Cache details locally
    // Else
      // Authenticate against locally cached details
  }
}
