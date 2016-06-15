/* @flow weak */

/**
 * OfflineMobile Android ConfirmModal
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { Button } from '../Button';
import Modal from 'react-native-modalbox';
import globalStyles from '../../globalStyles';

export function DeleteModal(props) {
  const { style, textStyle, onCancel, onConfirm, questionText, ...modalProps } = props;
  return (
    <Modal {...modalProps}
      style={[defaultStyles.modal, style]}
    >
      <Text style={textStyle}>
        {questionText}
      </Text>
      <View style={defaultStyles.buttonContainer}>
        <Button
          style={globalStyles.button}
          textStyle={globalStyles.buttonText}
          text={'Cancel'}
          onPress={onCancel}
        />
        <Button
          style={globalStyles.button}
          textStyle={globalStyles.buttonText}
          text={'Delete'}
          onPress={onConfirm}
        />
      </View>
    </Modal>
   );
}

DeleteModal.propTypes = {
  style: View.propTypes.style,
  textStyle: Text.propTypes.style,
  isOpen: React.PropTypes.bool.isRequired,
  questionText: React.PropTypes.string.isRequired,
  onCancel: React.PropTypes.func.isRequired,
  onConfirm: React.PropTypes.func.isRequired,
};
DeleteModal.defaultProps = {
  style: {},
  globalStyles: {},
  swipeToClose: false, // negating the default.
  backdropPressToClose: false, // negating the default.
};

const defaultStyles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 50,
  },
  modal: {
    height: (Dimensions.get('window').height) / 3,
  },
});
