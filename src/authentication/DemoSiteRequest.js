/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */
import { validationStrings } from '../localization';

const DEMO_SITE_URL = 'https://demo.msupply.org/api/v4/mobile/requestDemo';
export class DemoSiteRequest {
  async createActivationURL(username, email, password, repeatPassword) {
    this.validateFields(username, email, password, repeatPassword);

    let responseJson;
    try {
      const response = await fetch(DEMO_SITE_URL, {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      responseJson = await response.json();
      if (responseJson.error) throw new Error(responseJson.error);
      return responseJson;
    } catch (error) {
      // Pass error up
      throw error;
    }
  }

  validateFields(username, email, password, repeatPassword) {
    // Client side validation
    if (email.length === 0) throw new Error(validationStrings.email.required);
    if (!this.validateEmail(email)) throw new Error(validationStrings.email.valid);
    if (username.length === 0) throw new Error(validationStrings.username.required);
    if (password.length === 0) throw new Error(validationStrings.password.required);
    if (repeatPassword.length === 0) throw new Error(validationStrings.repeatPassword.required);
    if (password !== repeatPassword) throw new Error(validationStrings.password.matchRepeat);
    if (this.textLengthInvalid(password)) throw new Error(validationStrings.password.lengthInvalid);
    if (this.textContainsSpaces(password)) {
      throw new Error(validationStrings.password.containsSpaces);
    }
  }

  // Validation methods
  // TODO: Could be extracted to a helper file to be used elsewhere
  validateEmail(text) {
    const reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(text);
  }

  textContainsSpaces(text) {
    const reg = /^\S*$/;
    return !(reg.test(text));
  }

  textLengthInvalid(text, lessThen = 8, greaterThen = 32) {
    return text.length < lessThen || text.length > greaterThen;
  }
}
