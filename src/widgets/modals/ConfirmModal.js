/* @flow weak */

/**
 * OfflineMobile Android ConfirmModal
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import Button from '../Button';
import Modal from 'react-native-modalbox';
import globalStyles from '../../styles';

export default function ConfirmModal(props) {
  const { onCancel, onConfirm, questionText, style, ...other } = props;
  return (
    <Modal {...other}
      style={[globalStyles.modal, localStyles.modal, style.modal]}
    >
      <Text style={globalStyles.text}>
        {questionText}
      </Text>
      <View style={[globalStyles.container, localStyles.buttonContainer]}>
        <Button text={'Cancel'} onPress={onCancel} />
        <Button text={'Confirm'} onPress={onConfirm} />
      </View>
    </Modal>
   );
}

ConfirmModal.propTypes = {
  isOpen: React.PropTypes.bool.isRequired,
  questionText: React.PropTypes.string.isRequired,
  onCancel: React.PropTypes.func.isRequired,
  onConfirm: React.PropTypes.func.isRequired,
};
ConfirmModal.defaultProps = {
  style: {},
  swipeToClose: false,
};

const localStyles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 50,
  },
  modal: {
    height: (Dimensions.get('window').height) / 3,
  },
});
