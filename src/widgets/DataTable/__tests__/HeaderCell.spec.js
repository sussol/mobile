jest.unmock('../HeaderCell');
jest.unmock('enzyme');
jest.unmock('sinon');

import HeaderCell from '../HeaderCell';
import React, { View, TouchableOpacity } from 'react-native';
import sinon from 'sinon';
import { shallow } from 'enzyme';

describe('HeaderCell', () => {
  it('renders a TouchableOpacity when given onPress prop', () => {
    const wrapper = shallow(
      <HeaderCell onPress={jest.fn()} />
    );
    expect(wrapper.find(TouchableOpacity).length).toBe(1);
  });
  it('renders a view when not given onPress prop', () => {
    const wrapper = shallow(
      <HeaderCell />
    );
    expect(wrapper.find(View).length).toBe(1);
  });
  it('Calls given func when pressed', () => {
    const onBtnPress = sinon.spy();
    const wrapper = shallow(
      <HeaderCell onPress={() => onBtnPress()}>
        Foo
      </HeaderCell>
    );
    expect(wrapper.find(TouchableOpacity).length).toBe(1);
    expect(wrapper.contains('Foo')).toBe(true, 'Contains Foo');
    wrapper.find(TouchableOpacity).simulate('press');
    expect(onBtnPress.calledOnce).toBe(true, 'Button press');
  });
});
