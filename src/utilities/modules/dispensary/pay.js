/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createRecord } from '../../../database/utilities';
import { UIDatabase } from '../../../database';

/**
 * Helper method to pay off a prescription. Given a cash amount
 * a script and a patient, all receipts, credits and cash in
 * transactions will be created and the script will be finalised.
 *
 * Paying a script has three paths: underpay, exactpay and overpay.
 * All payments create a Receipt with a ReceiptLine.
 *
 * An underpayment creates a CustomerCreditLine and a ReceiptLine
 * for each source of credit (CustomerCredit) that credit was used from.
 * For example if a Patient has overpaid the last two prescriptions, then
 * there would be two sources of credit. If both sources were used to pay
 * off a script, a CustomerCreditLine is added to each CustomerCredit for
 * the amount used. A CustomerCredit can have many CustomerCreditLines If
 * only a fraction of credit is used at a time.
 *
 * An overpayment creates a CashIn Transaction to the value of the
 * amount overpaid.
 *
 * When using credit, credit must not become negative.
 * A script must be paid off in full, no partial payments.
 * Any amount overpaid must be gained in credit.
 *
 * @param {User} currentUser   The currently logged in user.
 * @param {Name} patient       A Name that is a patient
 * @param {Transaction} script A Transaction that is a prescription
 * @param {Number} cashAmount  The cash amount being paid for the script.
 * @param {Number} scriptTotal The total amount of the script.
 */

export const pay = (currentUser, patient, script, cashAmount, scriptTotal) => {
  if (!patient.isPatient) throw new Error('Patient is not a patient');
  if (!script.isPrescription) throw new Error('Script is not a script');
  if (!(script.items.length > 0)) throw new Error('Script is empty');
  if (script.isFinalised) throw new Error('Script is finalised');
  if (cashAmount < 0) throw new Error('Cash amount is negative');

  const { availableCredit } = patient;

  // Determine if this is an under, exact or over payment
  const creditAmount = scriptTotal - cashAmount;
  const usingCredit = creditAmount > 0;

  if (creditAmount > availableCredit) throw new Error('Not enough credit');

  // Create a Receipt and ReceiptLine for every payment path.
  const receipt = createRecord(UIDatabase, 'Receipt', currentUser, patient, cashAmount, '');
  createRecord(UIDatabase, 'ReceiptLine', receipt, script, cashAmount);

  // When using credit, create a CustomerCreditLine and ReceiptLine for each
  // source of credit being used.
  let creditToAllocate = creditAmount;
  if (usingCredit) {
    // Iterate over all the patients CustomerCredits, taking credit
    // from each with available credit, until all has been allocated.
    patient.customerCredits.some(customerCredit => {
      const creditFromCustomerCredit = customerCredit.outstanding;

      if (creditFromCustomerCredit >= 0) return false;

      const amountToTake = Math.min(Math.abs(creditFromCustomerCredit), creditToAllocate);

      createRecord(UIDatabase, 'CustomerCreditLine', customerCredit, amountToTake);
      createRecord(UIDatabase, 'ReceiptLine', receipt, customerCredit, -amountToTake);

      creditToAllocate -= amountToTake;

      return !creditToAllocate;
    });
  }

  if (usingCredit && creditToAllocate > 0) throw new Error('Credit not fully allocated');

  // Ensure the script is finalised once paid.
  script.finalise(UIDatabase);
};
