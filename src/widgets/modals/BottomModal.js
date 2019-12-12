/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Keyboard, StyleSheet, View, ViewPropTypes } from 'react-native';
import Modal from 'react-native-modalbox';

import { DARKER_GREY } from '../../globalStyles/index';

export class BottomModal extends React.Component {
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { isOpen } = this.props;
    const { isOpen: willOpen } = nextProps;

    if (!isOpen && willOpen) {
      // Opening modal, dismiss the keyboard
      Keyboard.dismiss();
    }
  }

  render() {
    const { children, style, ...modalProps } = this.props;
    return (
      <Modal {...modalProps} style={[localStyles.modal, style]}>
        <View style={[localStyles.container, style]}>{children}</View>
      </Modal>
    );
  }
}

BottomModal.propTypes = {
  style: ViewPropTypes.style,
  isOpen: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types, react/require-default-props
  children: PropTypes.any,
};

/* eslint-disable react/default-props-match-prop-types */
BottomModal.defaultProps = {
  style: {},
  swipeToClose: false, // negating the default.
  backdropPressToClose: false, // negating the default.
  position: 'bottom',
  backdrop: false,
};

export default BottomModal;

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: DARKER_GREY,
  },
});
