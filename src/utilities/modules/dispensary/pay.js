import { createRecord } from '../../../database/utilities/index';
import { UIDatabase } from '../../../database/index';

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const pay = (currentUser, patient, script, cashAmount) => {
  if (!patient.isPatient) throw new Error('Patient is not a patient');

  if (!script.isPrescription) throw new Error('Script is not a script');
  if (!(script.items.length > 0)) throw new Error('Script is empty');
  if (script.isFinalised) throw new Error('Script is finalised');

  if (cashAmount < 0) throw new Error('Cash amount is negative');

  const { total } = script;
  const { availableCredit } = patient;

  // Determine if this is an under, exact or over payment
  const creditAmount = total - cashAmount;
  const overpayAmount = cashAmount - total;
  const usingCredit = creditAmount > 0;
  const usingOverpayment = overpayAmount > 0;

  if (creditAmount > availableCredit) throw new Error('Not enough credit');

  // Create a Receipt and ReceiptLine for every payment path.
  const receipt = createRecord(UIDatabase, 'Receipt', currentUser, patient, cashAmount);
  createRecord(UIDatabase, 'ReceiptLine', script, null, cashAmount);

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

  if (usingOverpayment) createRecord(UIDatabase, 'CashIn', currentUser, patient, overpayAmount);

  // Ensure the script is finalised once paid.
  script.finalise(UIDatabase);
};
