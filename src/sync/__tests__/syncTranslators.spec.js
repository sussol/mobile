jest.unmock('../syncTranslators');

import {
  INTERNAL_TO_EXTERNAL,
  EXTERNAL_TO_INTERNAL,
  RECORD_TYPES,
} from '../syncTranslators';

describe('RECORD_TYPES', () => {
  it('translates from internal to external format', () => {
    const internalFormat = 'ItemLine';
    const externalFormat = RECORD_TYPES.translate(internalFormat, INTERNAL_TO_EXTERNAL);
    expect(externalFormat).toBe('item_line');
  });

  it('translates from external to internal format', () => {
    const externalFormat = 'item_line';
    const internalFormat = RECORD_TYPES.translate(externalFormat, EXTERNAL_TO_INTERNAL);
    expect(internalFormat).toBe('ItemLine');
  });

  it('returns undefined when given an unsupported key', () => {
    const externalFormat = 'unsupported';
    const internalFormat = RECORD_TYPES.translate(externalFormat, EXTERNAL_TO_INTERNAL);
    expect(internalFormat).toBe(undefined);
  });
});
