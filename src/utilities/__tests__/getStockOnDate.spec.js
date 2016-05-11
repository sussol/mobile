jest.unmock('../getStockOnDate');
jest.unmock('../../database/realm');
jest.unmock('enzyme');

import getStockOnDate from '../getStockOnDate';
import React, { View } from 'react-native';
import realm from '../../database/realm';


describe('getStockOnDate', () => {
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

  describe('filters by items passed with array', () => {
    it('returns results only for items in array', () => {
      // TODO:
    });
    it('handles and empty array correctly', () => {
      // TODO: I think it should just return results for all items.
    });
    it('filters by all items when array arg not given', () => {
      // TODO:
    });
  });

  it('ignores transactions with no confirm date', () => {
    // TODO:
  });

  describe('treats customer/supplier invoices and credit correctly', () => {
    it('does subtraction with invoices', () => {
      // TODO:
    });
    it('does addition with credit', () => {
      // TODO:
    });
    it('does addition with invoices', () => {
      // TODO:
    });
    it('does subtraction with credit', () => {
      // TODO:
    });
  });

  it('gives correct result on ', () => {

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

  it('does not change the realm it works on', () => {
    // TODO:
  });
});
