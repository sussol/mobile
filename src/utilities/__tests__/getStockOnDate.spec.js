jest.unmock('../getStockOnDate');
jest.unmock('../../database/realm');
jest.unmock('enzyme');

import getStockOnDate from '../getStockOnDate';
import realm from '../../database/realm';


describe('getStockOnDate', () => {
  afterEach(() => {
    realm.deleteAll();
  });

  it('returns a Realm.Results object', () => {
    const actual = getStockOnDate(new Date(), realm.objects('Items'));
    expect(typeof actual === 'object').toEqual(true); // TODO: Test for Realm.Results object
  });

  describe('filters by date, passed with Date object', () => {
    it('filters correctly with date in the near past', () => {
      // TODO:
    });
    it('filters correctly with date in the distant past', () => {
      // TODO:
    });
    it('filters correctly with date in the future', () => {
      // TODO:
    });
  });

  it('When 2nd arg is empty Realm.Results, skip func body and return empty Realm.Results', () => {
    // TODO: make sure that his takes less than 0.1 seconds, say.
  });

  it('ignores transactions with no confirm date', () => {
    // TODO:
  });

  describe('treats transaction types correctly', () => {
    it('does subtraction with customer invoices', () => {
      // TODO:
    });
    it('does addition with customer credit', () => {
      // TODO:
    });
    it('does addition with supplier invoices', () => {
      // TODO:
    });
    it('does subtraction with supplier credit', () => {
      // TODO:
    });
    it('takes no action on other types', () => {
      // TODO:
    });
  });

  describe('on small data set of 10 transactions', () => {
    it('gives correct result', () => {
      // TODO:
    });
    it('takes no more than 0.1 seconds', () => {
      // TODO:
    });
  });

  describe('on large data set 10000 transactions', () => {
    it('gives correct result', () => {
      // TODO:
    });
    it('takes no more than 3 seconds', () => {
      // TODO:
    });
  });

  it('does not change the realm DB it works on', () => {
    // TODO:
  });
});
