/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Keyboard, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modalbox';
import { DARKER_GREY } from '../../globalStyles/index';

export class BottomModal extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.isOpen && nextProps.isOpen) {
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
  style: View.propTypes.style,
  isOpen: PropTypes.bool.isRequired,
  children: PropTypes.any,
};
BottomModal.defaultProps = {
  style: {},
  swipeToClose: false, // negating the default.
  backdropPressToClose: false, // negating the default.
  position: 'bottom',
  backdrop: false,
};

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
