/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import Icon from 'react-native-vector-icons/Ionicons';

import { BottomModal } from './BottomModal';
import
{
  APP_FONT_FAMILY,
  DARK_GREY,
  PAGE_CONTENT_PADDING_HORIZONTAL,
} from '../../globalStyles';

export class SelectModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryText: '',
    };
  }

  render() {
    const {
      onCancel,
      options,
      onSelect,
      queryString,
      placeholderText,
      ...modalProps,
    } = this.props;

    return (
      <BottomModal {...modalProps}
        style={localStyles.modal}
      >
        <TouchableOpacity onPress={onCancel} style={localStyles.closeButton}>
          <Icon name="md-close" style={localStyles.closeIcon} />
        </TouchableOpacity>
        <Autocomplete
          style={localStyles.text}
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={localStyles.autocompleteContainer}
          data={options.filtered(queryString, this.state.queryText)}
          onChangeText={text => this.setState({ queryText: text })}
          placeholder={placeholderText}
          renderItem={(item) => (
            <TouchableOpacity onPress={() => onSelect(item)}>
              <Text style={[localStyles.text, localStyles.itemText]}>
                {item.toString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      </BottomModal>
     );
  }
}

SelectModal.propTypes = {
  isOpen: React.PropTypes.bool.isRequired,
  options: React.PropTypes.object.isRequired,
  queryString: React.PropTypes.string.isRequired,
  placeholderText: React.PropTypes.string,
  cancelText: React.PropTypes.string,
  onCancel: React.PropTypes.func,
  onSelect: React.PropTypes.func.isRequired,
};
SelectModal.defaultProps = {
  style: {},
  swipeToClose: false, // negating the default.
  backdropPressToClose: false, // negating the default.
  position: 'bottom',
  backdrop: false,
  placeholderText: 'Start typing to search',
};

const localStyles = StyleSheet.create({
  modal: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width - 2 * PAGE_CONTENT_PADDING_HORIZONTAL,
    alignSelf: 'center',
    backgroundColor: DARK_GREY,
    opacity: 0.96,
  },
  autocompleteContainer: {
    flex: 1,
    position: 'absolute', // Otherwise it moves depending on size of autocomplete results
    top: 190,
    left: 0,
    right: 0,
  },
  text: {
    fontSize: 15,
    fontFamily: APP_FONT_FAMILY,
  },
  itemText: {
    margin: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  closeIcon: {
    fontSize: 36,
    color: 'white',
  },
});
