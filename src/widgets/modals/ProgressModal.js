/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';
import Modal from 'react-native-modalbox';
import { ProgressBar } from '../../widgets';
import globalStyles, { DARK_GREY } from '../../globalStyles';

export class ProgressModal extends PureComponent {
  render() {
    const { isOpen, total, progress, title, message } = this.props;
    const currentProgress = progress + 1;
    return (
      <Modal
        isOpen={isOpen || (currentProgress < total)}
        backdropColor={DARK_GREY}
        backdropOpacity={0.97}
        style={globalStyles.confirmModal}
        textStyle={globalStyles.confirmModalText}
        swipeToClose={false} // negating the default.
        backdropPressToClose={false} // negating the default.
      >
        <Text>{title}</Text>
        <Text>{message}</Text>
        <ProgressBar
          total={total}
          progress={currentProgress}
          isComplete={currentProgress >= total}
        />
      </Modal>
    );
  }
}

ProgressModal.propTypes = {
  isOpen: PropTypes.bool,
  total: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
};
