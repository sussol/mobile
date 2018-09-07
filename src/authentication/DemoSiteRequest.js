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

    // Hash the password
    const passwordHash = hashPassword(password);

    // TODO: Need proper URL in 4D to work
    const URL = 'http://localhost:8080/v4/mobile/requestDemo';
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
      responseJson = response.json();

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
}
