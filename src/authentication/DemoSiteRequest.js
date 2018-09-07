/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

// const DEMO_SITE_REQUST_URL = '/sync/v3/mobile/requestDemo';

export class DemoSiteRequest {
  async createActivationURL(username, email, password, repeatPassword) {
    // Client side validation
    if (email.length === 0) throw new Error('Enter the E-mail');
    if (!this.validateEmail(email)) throw new Error('Enter a valid E-mail');
    if (username.length === 0) throw new Error('Enter the username');
    if (password.length === 0) throw new Error('Enter the password');
    if (repeatPassword.length === 0) throw new Error('Enter the repeat password');
    if (password !== repeatPassword) throw new Error('Password & repeat password must match');
  }

  validateEmail(text) {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(text);
  }
}
