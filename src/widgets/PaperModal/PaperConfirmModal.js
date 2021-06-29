import React from 'react';
import { StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { FlexColumn } from '../FlexColumn';
import { FlexView } from '../FlexView';
import { HazardIcon } from '../icons';
import { Spacer } from '../Spacer';
import { DARKER_GREY, SUSSOL_ORANGE, WHITE } from '../../globalStyles/index';
import { FlexRow } from '../FlexRow';
import { PageButton } from '../PageButton';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';

export const PaperConfirmModal = ({
  Icon,
  questionText,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  withOnePress,
}) => (
  <FlexColumn alignItems="center" justifyContent="center" flex={1} style={{ padding: 20 }}>
    <FlexView flex={1} alignItems="center" justifyContent="center">
      {Icon}
      <Spacer space={30} vertical />
      <Text style={localStyles.questionText}>{questionText}</Text>
    </FlexView>
    <FlexRow justifyContent="space-evenly" alignItems="center" style={{ width: '100%' }} flex={1}>
      <PageButton onPress={onCancel} text={cancelText} textStyle={localStyles.cancelText} />
      {withOnePress ? (
        <PageButtonWithOnePress
          onPress={onConfirm}
          text={confirmText}
          textStyle={localStyles.confirmText}
          style={localStyles.confirmButton}
        />
      ) : (
        <PageButton
          onPress={onConfirm}
          text={confirmText}
          textStyle={localStyles.confirmText}
          style={localStyles.confirmButton}
        />
      )}
    </FlexRow>
  </FlexColumn>
);

const localStyles = StyleSheet.create({
  questionText: { fontSize: 16, color: DARKER_GREY, fontWeight: '700', textAlign: 'center' },
  cancelText: { textTransform: 'uppercase' },
  confirmText: { textTransform: 'uppercase', color: WHITE },
  confirmButton: { backgroundColor: SUSSOL_ORANGE },
});

PaperConfirmModal.defaultProps = {
  Icon: <HazardIcon size={50} />,
  withOnePress: false,
};

PaperConfirmModal.propTypes = {
  Icon: PropTypes.node,
  questionText: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  cancelText: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  withOnePress: PropTypes.bool,
};
