/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { BottomModal } from './BottomModal';
import {
  APP_FONT_FAMILY,
  PAGE_CONTENT_PADDING_HORIZONTAL,
} from '../../globalStyles';

/**
 * A modal that can be displayed over the page content container, rendering any children
 * about two thirds of the way up, and a cross in the top right to close
 * @prop {boolean}    isOpen    Whether the modal is open
 * @prop {function}   onClose   A function to call if the close x is pressed
 * @prop {element}    children  The components to render within the modal
 */
export class PageContentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryText: '',
    };
  }

  render() {
    const { onClose, title, style, ...modalProps } = this.props;

    // Title bar is a flex row that renders the title if available and the close
    // button. Title should be top center. A View to the left of it achieves
    // this in flex box.
    const titleBar = (
      <View style={localStyles.titleBar}>
        {title && <View style={localStyles.flexSpacer} />}
        {title && <Text style={localStyles.title}>{title}</Text>}
        <View style={localStyles.closeButtonContainer}>
          <TouchableOpacity onPress={onClose} style={localStyles.closeButton}>
            <Icon name="md-close" style={localStyles.closeIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );

    return (
      <BottomModal {...modalProps} style={[localStyles.modal, style]}>
        {titleBar}
        <View style={localStyles.childrenContainer}>{this.props.children}</View>
      </BottomModal>
    );
  }
}

PageContentModal.propTypes = {
  ...BottomModal.propTypes,
  onClose: PropTypes.func,
  title: PropTypes.string,
};
PageContentModal.defaultProps = {
  style: {},
  swipeToClose: false, // negating the default.
  backdropPressToClose: false, // negating the default.
  position: 'bottom',
  backdrop: false,
};

const localStyles = StyleSheet.create({
  modal: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    opacity: 0.94,
    paddingBottom: 10,
  },
  childrenContainer: {
    flex: 1,
    marginLeft: PAGE_CONTENT_PADDING_HORIZONTAL,
    marginRight: PAGE_CONTENT_PADDING_HORIZONTAL,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  title: {
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
  closeButton: {
    width: 75,
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 36,
    color: 'white',
  },
  flexSpacer: {
    flex: 1,
  },
});
