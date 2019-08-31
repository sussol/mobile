/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';

import { CloseIcon } from '../icons';

import { APP_FONT_FAMILY, PAGE_CONTENT_PADDING_HORIZONTAL, DARKER_GREY } from '../../globalStyles';

/**
 * A modal that can be displayed over the page content container, rendering any children
 * about two thirds of the way up, and a cross in the top right to close
 * @prop {Bool}             fullScreen Force the modal to cover the entire screen.
 * @prop {Bool}             isVisible  Whether the modal is open
 * @prop {Func}             onClose    A function to call if the close x is pressed
 * @prop {String}           title      The title to show in within the modal.
 * @prop {React.Element}    children   The components to render within the modal
 */
const ModalContainer = ({ fullScreen, isVisible, onClose, title, children }) => {
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
  } = localStyles;

  const internalChildrenContainer = fullScreen ? childrenContainer : fullScreenChildrenContainer;

  const CloseButton = () => (
    <TouchableOpacity onPress={onClose} style={closeButton}>
      <CloseIcon />
    </TouchableOpacity>
  );

  const TitleBar = () => (
    <View style={titleBar}>
      <View style={flexSpacer} />
      <Text style={titleFont}>{title}</Text>
      <View style={closeButtonContainer}>{onClose && <CloseButton />}</View>
    </View>
  );

  return (
    <View style={modalContainer}>
      <Modal
        visible={isVisible}
        animationType="slide"
        fullScreen={false}
        transparent={true}
        hardwareAccelerated={true}
      >
        <View style={contentContainer}>
          <TitleBar />
          <View style={internalChildrenContainer}>{children}</View>
        </View>
      </Modal>
    </View>
  );
};

export default ModalContainer;

ModalContainer.propTypes = {
  fullScreen: PropTypes.bool,
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

ModalContainer.defaultProps = {
  fullScreen: false,
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
  fullScreenChildrenContainer: {
    flex: 1,
    alignItems: 'stretch',
    paddingLeft: PAGE_CONTENT_PADDING_HORIZONTAL,
    paddingRight: PAGE_CONTENT_PADDING_HORIZONTAL,
  },
  childrenContainer: {
    flex: 1,
    alignItems: 'stretch',
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
