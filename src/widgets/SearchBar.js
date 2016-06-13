import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/EvilIcons';
import { APP_FONT_FAMILY, SUSSOL_ORANGE } from '../globalStyles';

const defaultStyles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: SUSSOL_ORANGE,
    margin: 15,
  },
  textInput: {
    height: 40,
    width: 500,
    fontSize: 16,
    fontFamily: APP_FONT_FAMILY,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
});

export function SearchBar(props) {
  return (
    <View style={defaultStyles.container}>
      <Icon name="search" size={40} color={SUSSOL_ORANGE} />
      <TextInput
        {...props}
        onChange={(event) => props.onChange(event)}
      />
    </View>
  );
}

SearchBar.propTypes = {
  style: TextInput.propTypes.style,
  onChange: React.PropTypes.func,
};

SearchBar.defaultProps = {
  style: defaultStyles.textInput,
};
