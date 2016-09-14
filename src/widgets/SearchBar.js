import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/EvilIcons';
import { APP_FONT_FAMILY, SEARCH_BAR_WIDTH, SUSSOL_ORANGE } from '../globalStyles';

const defaultStyles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: SUSSOL_ORANGE,
    marginHorizontal: 5,
  },
  textInput: {
    height: 40,
    width: SEARCH_BAR_WIDTH,
    fontSize: 16,
    fontFamily: APP_FONT_FAMILY,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
});

export class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.inputReference = null;
  }

  render() {
    return (
      <TouchableOpacity
        style={defaultStyles.container}
        onPress={() => this.inputReference.focus()}
      >
        <Icon name="search" size={40} color={SUSSOL_ORANGE} />
        <TextInput
          {...this.props}
          ref={(reference) => (this.inputReference = reference)}
          underlineColorAndroid="transparent"
        />
      </TouchableOpacity>
    );
  }
}

SearchBar.propTypes = {
  style: TextInput.propTypes.style,
  onChange: React.PropTypes.func,
};

SearchBar.defaultProps = {
  style: defaultStyles.textInput,
};
