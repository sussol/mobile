/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button, ToggleBar } from '../widgets';

import globalStyles, { DARK_GREY, WARM_GREY, SUSSOL_ORANGE } from '../globalStyles';

export const ByProgramModal = props => {
  const { isOpen } = props;
  return (
    <Modal
      isOpen={isOpen}
      style={[globalStyles.modal, localStyles.modal]}
      backdropPressToClose={false}
      backdropOpacity={1}
      swipeToClose={false}
      position="top"
    >
      <TouchableOpacity onPress={onClose} style={localStyles.closeButton}>
        <Icon name="md-close" style={localStyles.closeIcon} />
      </TouchableOpacity>
    </Modal>
  );
};

export default ByProgramModal;

const localStyles = StyleSheet.create({
  modal: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: DARK_GREY,
    opacity: 0.88,
  },
  closeIcon: {
    fontSize: 36,
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
});

ByProgramModal.propTypes = {};

ByProgramModal.defaultProps = {};
