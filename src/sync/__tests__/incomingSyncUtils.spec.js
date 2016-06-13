// jest.unmock('../incomingSyncUtils');
//
// import { sanityCheckIncomingRecord } from '../incomingSyncUtils';
//
// describe('sanityCheckIncomingRecord', () => {
//   it('accepts a correctly formatted ItemLine record', () => {
//     const value = 'value';
//     const recordType = 'ItemLine';
//     const record = {
//       ID: value,
//       item_ID: value,
//       pack_size: value,
//       quantity: value,
//       batch: value,
//       expiry_date: value,
//       cost_price: value,
//       sell_price: value,
//     };
//     expect(sanityCheckIncomingRecord(recordType, record)).toBe(true);
//   });
//
//   it('rejects a record without an id', () => {
//     const value = 'value';
//     const recordType = 'ItemLine';
//     const record = {
//       item_ID: value,
//       pack_size: value,
//       quantity: value,
//       batch: value,
//       expiry_date: value,
//       cost_price: value,
//       sell_price: value,
//     };
//     expect(sanityCheckIncomingRecord(recordType, record)).toBe(false);
//   });
//
//   it('rejects an incorrectly formatted ItemLine record', () => {
//     const value = 'value';
//     const recordType = 'ItemLine';
//     const record = {
//       ID: value,
//       // item_ID: value, ItemLine with no item_ID should be rejected
//       pack_size: value,
//       quantity: value,
//       batch: value,
//       expiry_date: value,
//       cost_price: value,
//       sell_price: value,
//     };
//     expect(sanityCheckIncomingRecord(recordType, record)).toBe(false);
//   });
//
//   it('rejects an unsupported record type', () => {
//     const value = 'value';
//     const recordType = 'unsupported';
//     const record = {
//       ID: value,
//       item_ID: value,
//       pack_size: value,
//       quantity: value,
//       batch: value,
//       expiry_date: value,
//       cost_price: value,
//       sell_price: value,
//     };
//     expect(sanityCheckIncomingRecord(recordType, record)).toBe(false);
//   });
// });
