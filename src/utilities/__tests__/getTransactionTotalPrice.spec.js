jest.unmock('../getTransactionTotalPrice');

import { getTransactionTotalPrice } from '../getTransactionTotalPrice';

describe('getTransactionTotalPrice', () => {
  describe('calculates total prices correctly for supplier invoices', () => {
    it('correctly calculates the total price of a transaction with one line', () => {
      const costPrice = Math.random();
      const sellPrice = Math.random();
      const numberOfPacks = Math.random();
      const transaction = {
        type: 'supplier_invoice',
        lines: [
          {
            id: '1',
            numberOfPacks: numberOfPacks,
            costPrice: costPrice,
            sellPrice: sellPrice,
          },
        ],
      };
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(costPrice * numberOfPacks, 4);
    });

    it('correctly calculates the total price of a transaction with multiple lines', () => {
      const costPrice1 = Math.random();
      const costPrice2 = Math.random();
      const sellPrice1 = Math.random();
      const sellPrice2 = Math.random();
      const numberOfPacks = Math.random();
      const transaction = {
        type: 'supplier_invoice',
        lines: [
          {
            id: '1',
            numberOfPacks: numberOfPacks,
            costPrice: costPrice1,
            sellPrice: sellPrice1,
          },
          {
            id: '2',
            numberOfPacks: numberOfPacks,
            costPrice: costPrice2,
            sellPrice: sellPrice2,
          },
        ],
      };
      const sum = numberOfPacks * (costPrice1 + costPrice2);
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(sum, 4);
    });

    it('returns zero for a transaction with no lines', () => {
      const transaction = {
        type: 'supplier_invoice',
        lines: [],
      };
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(0, 4);
    });

    it('returns zero for a transaction with a line with no price', () => {
      const numberOfPacks = Math.random();
      const transaction = {
        type: 'supplier_invoice',
        lines: [
          {
            id: '1',
            numberOfPacks: numberOfPacks,
          },
        ],
      };
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(0, 4);
    });

    it('correctly calculates the total price of a transaction with some lines that have no price',
    () => {
      const costPrice1 = Math.random();
      const costPrice2 = Math.random();
      const sellPrice1 = Math.random();
      const sellPrice2 = Math.random();
      const numberOfPacks = Math.random();
      const transaction = {
        type: 'supplier_invoice',
        lines: [
          {
            id: '1',
            numberOfPacks: numberOfPacks,
          },
          {
            id: '2',
            numberOfPacks: numberOfPacks,
            costPrice: costPrice1,
            sellPrice: sellPrice1,
          },
          {
            id: '3',
            numberOfPacks: numberOfPacks,
            costPrice: costPrice2,
            sellPrice: sellPrice2,
          },
        ],
      };
      const sum = numberOfPacks * (costPrice1 + costPrice2);
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(sum, 4);
    });

    it('return 0 when not given numberOfPacks', () => {
      const costPrice1 = Math.random();
      const costPrice2 = Math.random();
      const sellPrice1 = Math.random();
      const sellPrice2 = Math.random();
      const transaction = {
        type: 'supplier_invoice',
        lines: [
          {
            id: '1',
            costPrice: costPrice1,
            sellPrice: sellPrice1,
          },
          {
            id: '2',
            costPrice: costPrice2,
            sellPrice: sellPrice2,
          },
        ],
      };
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(0, 4);
    });
  });
  describe('calculates total prices correctly for customer invoices', () => {
    it('correctly calculates the total price of a transaction with one line', () => {
      const costPrice = Math.random();
      const sellPrice = Math.random();
      const numberOfPacks = Math.random();
      const transaction = {
        type: 'customer_invoice',
        lines: [
          {
            id: '1',
            numberOfPacks: numberOfPacks,
            costPrice: costPrice,
            sellPrice: sellPrice,
          },
        ],
      };
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(sellPrice * numberOfPacks, 4);
    });

    it('correctly calculates the total price of a transaction with multiple lines', () => {
      const costPrice1 = Math.random();
      const costPrice2 = Math.random();
      const sellPrice1 = Math.random();
      const sellPrice2 = Math.random();
      const numberOfPacks = Math.random();
      const transaction = {
        type: 'customer_invoice',
        lines: [
          {
            id: '1',
            numberOfPacks: numberOfPacks,
            costPrice: costPrice1,
            sellPrice: sellPrice1,
          },
          {
            id: '2',
            numberOfPacks: numberOfPacks,
            costPrice: costPrice2,
            sellPrice: sellPrice2,
          },
        ],
      };
      const sum = numberOfPacks * (sellPrice1 + sellPrice2);
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(sum, 4);
    });

    it('returns zero for a transaction with no lines', () => {
      const transaction = {
        type: 'customer_invoice',
        lines: [],
      };
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(0, 4);
    });

    it('returns zero for a transaction with a line with no price', () => {
      const numberOfPacks = Math.random();
      const transaction = {
        type: 'customer_invoice',
        lines: [
          {
            id: '1',
            numberOfPacks: numberOfPacks,
          },
        ],
      };
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(0, 4);
    });

    it('correctly calculates the total price of a transaction with some lines that have no price',
    () => {
      const costPrice1 = Math.random();
      const costPrice2 = Math.random();
      const sellPrice1 = Math.random();
      const sellPrice2 = Math.random();
      const numberOfPacks = Math.random();
      const transaction = {
        type: 'customer_invoice',
        lines: [
          {
            id: '1',
            numberOfPacks: numberOfPacks,
          },
          {
            id: '2',
            numberOfPacks: numberOfPacks,
            costPrice: costPrice1,
            sellPrice: sellPrice1,
          },
          {
            id: '3',
            numberOfPacks: numberOfPacks,
            costPrice: costPrice2,
            sellPrice: sellPrice2,
          },
        ],
      };
      const sum = numberOfPacks * (sellPrice1 + sellPrice2);
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(sum, 4);
    });

    it('return 0 when not given numberOfPacks', () => {
      const costPrice1 = Math.random();
      const costPrice2 = Math.random();
      const sellPrice1 = Math.random();
      const sellPrice2 = Math.random();
      const transaction = {
        type: 'customer_invoice',
        lines: [
          {
            id: '1',
            costPrice: costPrice1,
            sellPrice: sellPrice1,
          },
          {
            id: '2',
            costPrice: costPrice2,
            sellPrice: sellPrice2,
          },
        ],
      };
      expect(getTransactionTotalPrice(transaction)).toBeCloseTo(0, 4);
    });
  });
});
