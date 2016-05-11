jest.unmock('../getStockOnDate');
jest.unmock('../../database/realm');
jest.unmock('enzyme');
jest.mock('NativeModules.Realm.debugHosts');

import getStockOnDate from '../getStockOnDate';
import realm from '../../database/realm';


describe('getStockOnDate', () => {
  afterEach(() => {
    realm.deleteAll();
  });

  it('returns a Realm.Results object', () => {
    // TODO:
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

  describe('treats customer/supplier invoices and credit correctly', () => {
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
  });

  it('gives correct result on small data set of 10 transactions', () => {
    // TODO:
  });
  it('takes no more than 3 seconds on large data set of 10000 transactions', () => {
    // TODO:
  });

  describe('with a small data set (10 transactions)', () => {
    it('gives correct result', () => {
      // TODO:
    });
  });

  describe('with a large data set (10000 transactions)', () => {
    it('gives correct result', () => {
      // TODO:
    });
  });

  it('does not change the realm DB it works on', () => {
    // TODO:
  });
});
