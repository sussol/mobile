/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import Modal from 'react-native-modalbox';
import { DARK_GREY } from '../../globalStyles';


export function BottomModal(props) {
  const { children, style, ...modalProps } = props;
  return (
    <Modal {...modalProps}
      style={[localStyles.modal, props.style]}
    >
      <View style={[localStyles.container, style]}>
        {children}
      </View>
    </Modal>
  );
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
