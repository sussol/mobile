/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import { ModalContainer } from './ModalContainer';

export const QrScannerModal = ({ isOpen, onClose }) => {
  const onBarCodeRead = ({ data, rawData, type }) => {
    console.log(data);
    console.log(rawData);
    console.log(type);
  };

  return (
    <ModalContainer
      isVisible={isOpen}
      style={localStyles.container}
      onClose={onClose}
      title="Scan QR Code"
    >
      <View style={localStyles.container}>
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
          <BarcodeMask showAnimatedLine={false} outerMaskOpacity={0.0} />
        </RNCamera>
      </View>
    </ModalContainer>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  preview: {
    alignItems: 'center',
    flexGrow: 0.5,
  },
});

QrScannerModal.defaultProps = {};

QrScannerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
