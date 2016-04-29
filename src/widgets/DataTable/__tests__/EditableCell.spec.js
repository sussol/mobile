jest.unmock('../EditableCell');
jest.unmock('enzyme');
jest.unmock('sinon');

import EditableCell from '../EditableCell';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import React, {
  TextInput,
  View,
} from 'react-native';

describe('EditableCell', () => {
  it('renders a View and TextInput', () => {
    const wrapper = shallow(
      <EditableCell />
    );
    expect(wrapper.state('value')).toEqual('N/A');
    expect(wrapper.find(View).length).toBe(1);
    expect(wrapper.find(TextInput).length).toBe(1);
  });

  it('sets state to value as string', () => {
    const wrapper = shallow(
      <EditableCell
        value={50}
      />
    );
    expect(wrapper.state('value')).toEqual('50');
  });

  xit('changes state with onChange event', () => {
    const wrapper = shallow(
      <EditableCell />
    );
    console.log(`Debug:\n${wrapper.debug()}\n`);
    expect(wrapper.state('value')).toEqual('N/A');
    wrapper.find(TextInput).simulate('change');
    expect(wrapper.state('value')).toEqual('bar');
  });

  it('onEndEditing event triggers callback', () => {
    const callback = sinon.spy();
    const wrapper = shallow(
      <EditableCell
        value={'foo'}
        onEndEditing={callback}
      />
    );
    wrapper.find(TextInput).simulate('endEditing');
    expect(callback.called).toBe(true);
  });
});
