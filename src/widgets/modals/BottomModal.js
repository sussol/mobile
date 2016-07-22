/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard'; // eslint-disable-line import/no-unresolved
import Modal from 'react-native-modalbox';
import { DARK_GREY } from '../../globalStyles';


export class BottomModal extends React.Component {

  componentWillReceiveProps(nextProps) {
    if (!this.props.isOpen && nextProps.isOpen) { // Opening modal, dismiss the keyboard
      dismissKeyboard();
    }
  }

  render() {
    const { children, style, ...modalProps } = this.props;
    return (
      <Modal
        {...modalProps}
        style={[localStyles.modal, style]}
      >
        <View style={[localStyles.container, style]}>
          {children}
        </View>
      </Modal>
    );
  }
}

BottomModal.propTypes = {
  style: View.propTypes.style,
  isOpen: React.PropTypes.bool.isRequired,
  children: React.PropTypes.any,
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
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 5,
  },
  modal: {
    height: 60,
    backgroundColor: DARK_GREY,
  },
});
