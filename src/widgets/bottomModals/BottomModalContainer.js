/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Keyboard, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modalbox';

import { DARKER_GREY } from '../../globalStyles/index';

export const BottomModalContainer = ({
  children,
  isOpen,
  swipeToClose,
  backdropPressToClose,
  position,
  backdrop,
  modalStyle,
  containerStyle,
  ...modalProps
}) => {
  React.useEffect(() => {
    Keyboard.dismiss();
  }, [isOpen]);

  return (
    <Modal
      swipeToClose={swipeToClose}
      backdropPressToClose={backdropPressToClose}
      position={position}
      backdrop={backdrop}
      isOpen={isOpen}
      {...modalProps}
      style={{ ...localStyles.modalStyle, ...modalStyle }}
    >
      <View style={localStyles.containerStyle}>{children}</View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalStyle: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: DARKER_GREY,
  },
});

BottomModalContainer.defaultProps = {
  swipeToClose: false,
  backdropPressToClose: false,
  position: 'bottom',
  backdrop: false,
  modalStyle: localStyles.modalStyle,
  containerStyle: localStyles.containerStyle,
};

BottomModalContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  swipeToClose: PropTypes.bool,
  backdropPressToClose: PropTypes.bool,
  position: PropTypes.string,
  backdrop: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]).isRequired,
  modalStyle: PropTypes.object,
  containerStyle: PropTypes.object,
};
