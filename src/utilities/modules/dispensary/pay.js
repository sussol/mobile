/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createRecord } from '../../../database/utilities';
import { UIDatabase } from '../../../database';
import { dispensingStrings } from '../../../localization';

/**
 * Helper method to pay off a prescription. After payment, the script
 * will be finalised.
 *
 * Paying a script has three paths: exact cash* payment, credit payment and
 * mixed cash+payment.
 * * [cash payment really meaning the patient has paid some amount that is not
 * credit]
 *
 * Every payment starts with a Receipt.
 * There are then two ReceiptLines created:
 * If there is a cash payment portion: create a ReceiptLine with an amount equal.
 * If there is a credit portion: create a ReceiptLine with the full amount of credit used.
 *
 * Then the amount of credit used needs to be reduced from the credit sources*.
 * * credit source: [Sources of credit are from customer_credit type Transactions, as well as
 * cancelled customer invoices. These invoices will have their outstanding field < 0 - where the
 * absolute value is the amount of credit the patient has from that source. I.e. a customer_credit
 * transaction with an outstanding equal to -20 shows the patient has $20 of credit]
 *
 * Using credit:
 * - Credit must not become negative.
 * - Credit must come from a credit source.
 * - A script must be paid off in full, no partial payments.
 *
 * To use credit, iterate over each credit source and reduce the outstanding value by the amount
 * of credit being used.
 *
 * @param {User} currentUser   The currently logged in user.
 * @param {Name} patient       A Name that is a patient
 * @param {Transaction} script A Transaction that is a prescription
 * @param {Number} cashAmount  The cash amount being paid for the script.
 * @param {Number} scriptTotal The total amount of the script.
 */

export const pay = (
  currentUser,
  patient,
  script,
  cashAmount,
  scriptTotal,
  subtotal,
  discountAmount,
  discountRate
) => {
  if (!patient.isPatient) throw new Error('Patient is not a patient');
  if (!script.isPrescription) throw new Error('Script is not a script');
  if (!(script.items.length > 0)) throw new Error('Script is empty');
  if (script.isFinalised) throw new Error('Script is finalised');
  if (cashAmount < 0) throw new Error('Cash amount is negative');

  const { availableCredit } = patient;

  // Determine if the payment is using credit.
  const creditAmount = scriptTotal - cashAmount;
  const usingCredit = creditAmount > 0;

  if (creditAmount > availableCredit) throw new Error('Not enough credit');

  // Create a Receipt for every payment path.
  const receiptDescription = `${dispensingStrings.receipt_for_invoice} ${script.serialNumber}`;
  const receipt = createRecord(
    UIDatabase,
    'Receipt',
    currentUser,
    patient,
    cashAmount,
    null,
    receiptDescription
  );

  // Create a receipt line for the full non-credit amount, if any.
  if (cashAmount) createRecord(UIDatabase, 'ReceiptLine', receipt, script, cashAmount);

  let creditToAllocate = creditAmount;

  if (usingCredit) {
    // Create a receipt line for the full credit amount, if any.
    createRecord(UIDatabase, 'ReceiptLine', receipt, script, creditAmount);

    // Iterate over all the patients credit sources, taking credit from each with
    // available credit, by reducing the outstanding value until all has been allocated.
    patient.creditSources.some(creditSource => {
      const { outstanding: outstandingCredit } = creditSource;

      if (outstandingCredit >= 0) return false;

      const creditUsed = Math.min(Math.abs(outstandingCredit), creditToAllocate);
      createRecord(UIDatabase, 'ReceiptLine', receipt, creditSource, -creditUsed, 'credit');

      creditToAllocate -= creditUsed;

      creditSource.outstanding -= creditUsed;
      UIDatabase.save('Transaction', creditSource);

      return !creditToAllocate;
    });
  }

  if (usingCredit && creditToAllocate > 0) throw new Error('Credit not fully allocated');

  // Ensure the script is finalised once paid.
  script.subtotal = subtotal;
  script.insuranceDiscountAmount = discountAmount;
  script.insuranceDiscountRate = discountRate;
  script.finalise(UIDatabase);
};
