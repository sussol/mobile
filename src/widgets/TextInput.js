/* @flow weak */

/**
 * mSupply MobileAndroid
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';

import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
} from 'react-native';

/**
 * Renders a View containing a RN TextInput. For allowing changing underline color of the TextInput
 * in both Android and iOS, which is not supported in the current RN TextInput (v0.27).
 * @param   {object}  props   Properties passed where component was created.
 * @return  {React.Component} View containing a TextInput
 */
export function TextInput(props) {
  const { style, textStyle, ...textInputProps } = props;
  return (
    <View style={[localStyles.container, style]}>
      <RNTextInput
        {...textInputProps}
        style={[textStyle, localStyles.textInput]}
      />
    </View>
  );
}

TextInput.propTypes = {
  ...RNTextInput.propTypes,
  style: View.propTypes.style,
  textStyle: RNTextInput.propTypes.style,
};

const localStyles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'white',
  },
  textInput: {
    height: 40,
    width: 500,
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
});
