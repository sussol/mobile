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
import { WARM_GREY } from '../../globalStyles';

export function BottomModal(props) {
  const { children, ...modalProps } = props;
  return (
    <Modal {...modalProps}
      style={[localStyles.modal, props.style]}
    >
      <View style={localStyles.container}>
        {children}
      </View>
    </Modal>
   );
}

BottomModal.propTypes = {
  isOpen: React.PropTypes.bool.isRequired,
  children: React.PropTypes.any,
  style: View.propTypes.style,
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
    backgroundColor: WARM_GREY,
  },
});
