/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';

import { CloseIcon } from '../icons';

import {
  APP_FONT_FAMILY,
  FULL_SCREEN_MODAL_MARGIN,
  PAGE_CONTENT_PADDING_HORIZONTAL,
  DARKER_GREY,
} from '../../globalStyles';

/**
 * A modal that can be displayed over the page content container, rendering any children
 * about two thirds of the way up, and a cross in the top right to close
 * @prop {Bool}             fullScreen Force the modal to cover the entire screen.
 * @prop {Bool}             isVisible  Whether the modal is open
 * @prop {Func}             onClose    A function to call if the close x is pressed
 * @prop {String}           title      The title to show in within the modal.
 * @prop {React.Element}    children   The components to render within the modal
 */
const ModalContainer = ({ fullScreen, isVisible, onClose, title, children, noCancel }) => {
  const {
    contentContainer,
    modalContainer,
    titleFont,
    titleBar,
    closeButtonContainer,
    childrenContainer,
    fullScreenChildrenContainer,
    flexSpacer,
    closeButton,
    fullScreenContentContainer,
  } = localStyles;

  const internalChildrenContainer = fullScreen ? fullScreenChildrenContainer : childrenContainer;
  const internalContentContainer = fullScreen ? fullScreenContentContainer : contentContainer;

  const CloseButton = () => (
    <TouchableOpacity onPress={onClose} style={closeButton}>
      <CloseIcon />
    </TouchableOpacity>
  );

  const TitleBar = () => (
    <View style={titleBar}>
      <View style={flexSpacer} />
      {!!title && <Text style={titleFont}>{title}</Text>}
      <View style={closeButtonContainer}>{onClose && !noCancel && <CloseButton />}</View>
    </View>
  );

  return (
    <View style={modalContainer}>
      <Modal
        visible={isVisible}
        animationType="slide"
        fullScreen={fullScreen}
        transparent
        hardwareAccelerated={true}
      >
        <View style={internalContentContainer}>
          <TitleBar />
          <View style={internalChildrenContainer}>{children}</View>
        </View>
      </Modal>
    </View>
  );
};

export default ModalContainer;

ModalContainer.defaultProps = {
  fullScreen: false,
  title: '',
  noCancel: false,
  onClose: null,
};

ModalContainer.propTypes = {
  fullScreen: PropTypes.bool,
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  noCancel: PropTypes.bool,
};

const localStyles = StyleSheet.create({
  modalContainer: { backgroundColor: DARKER_GREY },

  contentContainer: {
    flex: 1,
    backgroundColor: DARKER_GREY,
    marginLeft: PAGE_CONTENT_PADDING_HORIZONTAL,
    marginRight: PAGE_CONTENT_PADDING_HORIZONTAL,
    marginBottom: PAGE_CONTENT_PADDING_HORIZONTAL,
    marginTop: 56,
    opacity: 0.94,
    paddingBottom: 10,
  },
  fullScreenContentContainer: {
    flex: 1,
    backgroundColor: DARKER_GREY,
    marginLeft: FULL_SCREEN_MODAL_MARGIN,
    marginRight: FULL_SCREEN_MODAL_MARGIN,
    marginBottom: FULL_SCREEN_MODAL_MARGIN,
    marginTop: FULL_SCREEN_MODAL_MARGIN,
    opacity: 0.94,
    paddingBottom: 10,
  },
  fullScreenChildrenContainer: {
    flex: 1,
    paddingLeft: PAGE_CONTENT_PADDING_HORIZONTAL,
    paddingRight: PAGE_CONTENT_PADDING_HORIZONTAL,
  },
  childrenContainer: {
    flex: 1,
    paddingLeft: PAGE_CONTENT_PADDING_HORIZONTAL,
    paddingRight: PAGE_CONTENT_PADDING_HORIZONTAL,
  },
  flexSpacer: {
    flex: 1,
  },
  titleFont: {
    justifyContent: 'center',
    fontFamily: APP_FONT_FAMILY,
    color: 'white',
    fontSize: 20,
  },
  closeButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  closeButton: {
    width: 75,
    alignItems: 'center',
  },
});
