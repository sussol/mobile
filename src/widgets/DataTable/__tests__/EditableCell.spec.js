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
    expect(wrapper.find(View).length).toBe(1);
    expect(wrapper.find(TextInput).length).toBe(1);
  });
  it('componentWillMount sets state to value as string', () => {
    const wrapper = shallow(
      <EditableCell
        value={50}
      />
    );
    expect(wrapper.state('value')).toEqual('50');
  });
  // it('onPress works', () => {
  //   const callback = sinon.spy();
  //   const wrapper = shallow(
  //     <EditableCell
  //       value={'Foo'}
  //       onEndEditing={callback}
  //     />
  //   );
  //   wrapper.find(TextInput).simulate('focusin');
  //   wrapper.find(TextInput).simulate('focusout');
  //   expect(callback.called).toBe(true);
  // });
});
