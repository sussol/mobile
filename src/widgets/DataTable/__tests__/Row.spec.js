jest.unmock('../Row');
jest.unmock('enzyme');
jest.unmock('sinon');

import Row from '../Row';
import React, { View, TouchableOpacity } from 'react-native';
import sinon from 'sinon';
import { shallow } from 'enzyme';

describe('Row', () => {
  it('renders a TouchableOpacity', () => {
    const wrapper = shallow(
      <Row />
    );
    expect(wrapper.find(TouchableOpacity).length).toBe(1);
  });

  it('renders children', () => {
    const wrapper = shallow(
      <Row>
        <Text />
      </Row>
    );
    expect(wrapper.find(Text).length).toEqual(1);
  });

  it('changes expanded state when given an expansion function and pressed', () => {
    const wrapper = shallow(
      <Row renderExpansion={jest.fn()} />
    );
    expect(wrapper.state('expanded')).toEqual(false, 'before press');
    wrapper.find(TouchableOpacity).simulate('press');
    expect(wrapper.state('expanded')).toEqual(true, 'after press');
  });

  it('does not change expanded state when not given an expansion and pressed', () => {
    const wrapper = shallow(
      <Row />
    );
    expect(wrapper.state('expanded')).toEqual(false);
    wrapper.simulate('press');
    expect(wrapper.state('expanded')).toEqual(false);
  });

  it('Calls given expansion func when pressed', () => {
    const renderExpansion = sinon.spy(() => <Text>foo</Text>);
    const wrapper = shallow(
      <Row renderExpansion={() => renderExpansion()} />
    );
    expect(wrapper.find(Text).length).toEqual(0);
    wrapper.find(TouchableOpacity).simulate('press');
    expect(renderExpansion.calledOnce).toBe(true, 'Button press');
    expect(wrapper.find(Text).length).toEqual(1);
  });
});
