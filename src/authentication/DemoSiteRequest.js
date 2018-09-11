/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */
import { hashPassword } from 'sussol-utilities';
export class DemoSiteRequest {
  async createActivationURL(username, email, password, repeatPassword) {
    // Client side validation
    if (email.length === 0) throw new Error('Enter the E-mail');
    if (!this.validateEmail(email)) throw new Error('Enter a valid E-mail');
    if (username.length === 0) throw new Error('Enter the username');
    if (password.length === 0) throw new Error('Enter the password');
    if (repeatPassword.length === 0) throw new Error('Enter the repeat password');
    if (password !== repeatPassword) throw new Error('Password & repeat password must match');
    if (this.textLengthBetween(password)) throw new Error('Password must be 8-32 characters long');
    if (!this.textNotBlank(password)) throw new Error('Password cannot contain spaces.');
    // Hash the password
    const passwordHash = hashPassword(password);

    // TODO: Need proper URL in 4D to work
    const URL = 'http://192.168.3.145:7848/api/v4/mobile/requestDemo';
    let responseJson;
    try {
      const response = await fetch(URL, {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          email: email,
          password: passwordHash,
        }),
      });
      responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.error);
      }
      return responseJson;
    } catch (error) {
      // Pass error up
      throw error;
    }
  }

  validateEmail(text) {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(text);
  }

  textNotBlank(text) {
    const reg = /^\S*$/;
    return reg.test(text);
  }

  textLengthBetween(text, lessThen = 8, greaterThen = 32) {
    return text.length < lessThen || text.length > greaterThen;
  }
}
