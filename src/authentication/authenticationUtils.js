import sha256 from 'sha256';
import Base64 from 'base-64';

export const AUTH_ERROR_CODES = {
  INVALID_PASSWORD: 'Invalid username or password',
  CONNECTION_FAILURE: 'Unable to connect',
  MISSING_CREDENTIALS: 'Missing username and/or password',
};

const {
  INVALID_PASSWORD,
  CONNECTION_FAILURE,
  MISSING_CREDENTIALS,
} = AUTH_ERROR_CODES;

/**
* Check whether the username and password are valid given an authentication URL.
* @param  {string}   authURL   The URL to authenticate against
* @param  {string}   username  The username to test
* @param  {string}   password  The password to test
* @param  {function} onSuccess The function to call on successful
*                              authentication
* @param  {function} onFailure The function to call if there is an error, with
*                              the errror message as a parameter
* @return {object}             JSON formatted response object
*/
export async function authenticateAsync(authURL, username, password) {
  if (username.length === 0 || password.length === 0) { // Missing username or password
    throw new Error(MISSING_CREDENTIALS);
  }

  let responseJson;
  try {
    const response = await fetch(authURL, {
      headers: {
        Authorization: getAuthHeader(username, password),
      },
    });
    responseJson = await response.json();
  } catch (error) {
    throw new Error(CONNECTION_FAILURE);
  }

  if (responseJson.error) { // Username/password invalid
    throw new Error(INVALID_PASSWORD);
  }
  return responseJson;
}

export function getAuthHeader(username, password) {
  return `Basic ${Base64.encode(`${username}:${password}`)}`;
}

export function hashPassword(password) {
  return sha256(password);
}
