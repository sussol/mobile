jest.unmock('../Cell');
jest.unmock('enzyme');

import Cell from '../Cell';
import React, { View } from 'react-native';

import { shallow } from 'enzyme';

describe('Cell', () => {
  it('renders a view', () => {
    const wrapper = shallow(
      <Cell />
    );
    expect(wrapper.find(View).length).toBe(1);
  });
  it('renders some Text', () => {
    const wrapper = shallow(
      <Cell>Foo</Cell>
    );
    expect(wrapper.contains('Foo')).toBe(true);
  });
});
