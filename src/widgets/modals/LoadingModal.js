/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

import { DARK_GREY } from '../../globalStyles';
import dismissKeyboard from 'dismissKeyboard'; // eslint-disable-line import/no-unresolved
import Modal from 'react-native-modalbox';
// import globalStyles from '../../globalStyles';

export function LoadingModal(props) {
  if (props.isOpen) dismissKeyboard();
  const { style, ...modalProps } = props;
  return (
    <Modal
      {...modalProps}
      style={[defaultStyles.modal, style]}
    >
      <ActivityIndicator
        style={{ transform: [{ scale: 2 }] }}
        size="large"
      />
    </Modal>
   );
}

LoadingModal.propTypes = {
  style: View.propTypes.style,
  isOpen: React.PropTypes.bool.isRequired,
};
LoadingModal.defaultProps = {
  style: {},
  swipeToClose: false, // negating the default.
  backdropPressToClose: false, // negating the default.
  position: 'bottom',
  backdrop: false,
  animationDuration: 0,
};

const defaultStyles = StyleSheet.create({
  modal: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DARK_GREY,
    opacity: 0.88,
  },
});
