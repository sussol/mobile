/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { OnePressButton } from '../';
import Modal from 'react-native-modalbox';
import globalStyles, { DARK_GREY } from '../../globalStyles';
import { modalStrings } from '../../localization';

export function ConfirmModal(props) {
  // On opening, dismiss the keyboard to ensure editable cells lose their focus
  // and their values become fixed (so that they save correctly)
  if (props.isOpen) Keyboard.dismiss();
  const {
    style,
    textStyle,
    onCancel,
    onConfirm,
    questionText,
    noCancel,
    ...modalProps,
  } = props;
  return (
    <Modal {...modalProps} style={style}>
      {!noCancel && onCancel && (
        <TouchableOpacity onPress={onCancel} style={defaultStyles.closeButton}>
          <Icon name="md-close" style={defaultStyles.closeIcon} />
        </TouchableOpacity>
      )}
      <View style={defaultStyles.contentContainer}>
        <Text style={textStyle}>{questionText}</Text>
        <View
          style={[defaultStyles.buttonContainer, props.buttonContainerStyle]}
        >
          {!noCancel && onCancel && (
            <OnePressButton
              style={[globalStyles.button, props.cancelButtonStyle]}
              textStyle={[globalStyles.buttonText, props.buttonTextStyle]}
              text={props.cancelText}
              onPress={onCancel}
            />
          )}
          {onConfirm && (
            <OnePressButton
              style={[globalStyles.button, props.confirmButtonStyle]}
              textStyle={[globalStyles.buttonText, props.buttonTextStyle]}
              text={props.confirmText}
              onPress={onConfirm}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

ConfirmModal.propTypes = {
  style: ViewPropTypes.style,
  buttonContainerStyle: ViewPropTypes.style,
  buttonTextStyle: Text.propTypes.style,
  cancelButtonStyle: ViewPropTypes.style,
  cancelText: PropTypes.string,
  confirmButtonStyle: ViewPropTypes.style,
  confirmText: PropTypes.string,
  textStyle: Text.propTypes.style,
  isOpen: PropTypes.bool.isRequired,
  questionText: PropTypes.string.isRequired,
  noCancel: PropTypes.bool,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};
ConfirmModal.defaultProps = {
  backdropColor: DARK_GREY,
  backdropOpacity: 0.97,
  style: globalStyles.confirmModal,
  textStyle: globalStyles.confirmModalText,
  buttonContainerStyle: globalStyles.confirmModalButtonContainer,
  cancelButtonStyle: globalStyles.confirmModalButton,
  confirmButtonStyle: [
    globalStyles.confirmModalButton,
    globalStyles.confirmModalConfirmButton,
  ],
  buttonTextStyle: globalStyles.confirmModalButtonText,
  cancelText: modalStrings.cancel,
  confirmText: modalStrings.confirm,
  swipeToClose: false, // negating the default.
  backdropPressToClose: false, // negating the default.
};

const defaultStyles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 50,
  },
  contentContainer: {
    paddingTop: Dimensions.get('window').height / 3, // Start the content 33% down the page
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  closeIcon: {
    fontSize: 36,
    color: 'white',
  },
});
