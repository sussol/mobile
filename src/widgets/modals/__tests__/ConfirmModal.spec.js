/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react-native';

import { Button } from 'react-native-ui-components';

import { shallow } from 'enzyme';
import sinon from 'sinon';

import { ConfirmModal } from '../ConfirmModal';

jest.unmock('../ConfirmModal');
jest.unmock('enzyme');
jest.unmock('sinon');

describe('ConfirmModal', () => {
  let cancelCallBack;
  let confirmCallBack;
  let wrapper;

  beforeEach(() => {
    cancelCallBack = sinon.spy();
    confirmCallBack = sinon.spy();
    wrapper = shallow(
      <ConfirmModal
        isOpen
        questionText="This is a test?"
        onCancel={cancelCallBack}
        onConfirm={confirmCallBack}
      />
    );
  });

  it('renders string from prop', () => {
    expect(wrapper.contains('This is a test?')).toBe(true);
  });

  it('triggers cancelCallBack when cancel pressed', () => {
    expect(cancelCallBack.calledOnce).toBe(false);
    expect(confirmCallBack.calledOnce).toBe(false);
    wrapper
      .find(Button)
      .first()
      .simulate('press');
    expect(cancelCallBack.calledOnce).toBe(true);
    expect(confirmCallBack.calledOnce).toBe(false);
  });

  it('triggers confirmCallBack when confirm pressed', () => {
    expect(cancelCallBack.calledOnce).toBe(false);
    expect(confirmCallBack.calledOnce).toBe(false);
    wrapper
      .find(Button)
      .last()
      .simulate('press');
    expect(cancelCallBack.calledOnce).toBe(false);
    expect(confirmCallBack.calledOnce).toBe(true);
  });
});
