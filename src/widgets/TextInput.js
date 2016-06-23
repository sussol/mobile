import React, {
  PropTypes,
} from 'react';

import {
  View,
  TextInput,
} from 'react-native';

export function TextInput(props) {
  return (
    <View style={[localStyles.container, props.style]}>
      <TextInput
        {textInputProps...}
      />
    </View>
  );
}

TextInput.propTypes = {};

TextInput.defaultProps = {};
