/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import { ModalContainer } from './ModalContainer';
import { SUSSOL_ORANGE } from '../../globalStyles/colors';
import { modalStrings } from '../../localization/index';
import { FlexRow } from '../FlexRow';

export const QrScannerModal = ({ isOpen, onClose, onBarCodeRead }) => (
  <ModalContainer
    isVisible={isOpen}
    onBarcodeRead={onBarCodeRead}
    onClose={onClose}
    title={modalStrings.qr_scanner_header}
  >
    <FlexRow flex={1} justifyContent="center">
      <RNCamera
        androidCameraPermissionOptions={{
          title: 'Camera access is required to scan QR codes',
          message: 'Your device will prompt you for access on the next screen.',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        captureAudio={false}
        flashMode={RNCamera.Constants.FlashMode.on}
        onBarCodeRead={onBarCodeRead}
        style={localStyles.preview}
      >
        <BarcodeMask edgeColor={SUSSOL_ORANGE} showAnimatedLine={false} outerMaskOpacity={0.0} />
      </RNCamera>
    </FlexRow>
  </ModalContainer>
);

const localStyles = StyleSheet.create({
  preview: {
    alignItems: 'center',
    flexGrow: 0.5,
  },
});

QrScannerModal.defaultProps = {};

QrScannerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onBarCodeRead: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
