/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createRecord } from '../../../database/utilities';
import { UIDatabase } from '../../../database';

/**
 * Utility to refund a collection of TransactionBatch records. Creates a
 * single CustomerCredit and for each TransactionBatch that should be
 * refunded, a RefundLine record, which enters the batch back into stock
 * and adds credit for the patient.
 *
 *
 * @param {User}               currentUser The currently logged in user.
 * @param {Name}               patient     The patient to refund to
 * @param {TransactionBatch[]} batches     Array of batches to be refund
 */
export const refund = (currentUser, patient, batches) => {
  const forSamePatient = batches.every(({ transaction }) => {
    const { otherParty } = transaction;
    return patient.id === otherParty?.id;
  });

  if (!batches.length) throw new Error('Trying to refund void');
  if (!forSamePatient) throw new Error('Batches for different patients!');

  const sumOfCredit = batches.reduce((acc, { total }) => acc + total, 0);

  const customerCredit = createRecord(
    UIDatabase,
    'CustomerCredit',
    currentUser,
    patient,
    sumOfCredit
  );

  const addedBatches = batches.map(batch =>
    createRecord(UIDatabase, 'RefundLine', customerCredit, batch)
  );

  return [customerCredit, addedBatches];
};
