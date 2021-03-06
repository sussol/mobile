import React from 'react';
import PropTypes from 'prop-types';
import {
  TouchableWithoutFeedback,
  useWindowDimensions,
  Modal,
  KeyboardAvoidingView,
  View,
  Pressable,
} from 'react-native';

import { FlexView } from '../FlexView';
import { Paper } from '../Paper';
import { TRANSPARENT_GREY } from '../../globalStyles/index';

export const PaperModalContainer = ({ isVisible, onClose, children, heightFactor }) => {
  const { width, height } = useWindowDimensions();

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      hardwareAccelerated
      onRequestClose={onClose}
      transparent
    >
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <FlexView
          flex={1}
          justifyContent="center"
          alignItems="center"
          style={{ backgroundColor: TRANSPARENT_GREY }}
        >
          <Paper paddingHorizontal={0}>
            <View style={{ height: heightFactor * height, width: width / 2 }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  /* This Touchable is capturing gestures such that only the transparent overlay
                     closes the modal.  */
                }}
              >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                  {children}
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </Paper>
        </FlexView>
      </Pressable>
    </Modal>
  );
};

PaperModalContainer.defaultProps = {
  heightFactor: 0.5,
};

PaperModalContainer.propTypes = {
  heightFactor: PropTypes.number,
  isVisible: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]).isRequired,
  onClose: PropTypes.func.isRequired,
};
