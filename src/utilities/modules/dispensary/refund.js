/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createRecord } from '../../../database/utilities';
import { UIDatabase } from '../../../database';

export const refund = (currentUser, patient, batches) => {
  const forSamePatient = batches.every(({ transaction }) => {
    const { otherPartyName } = transaction;
    return patient.id === otherPartyName.id;
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
