/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-ui-components';

import { TextInput } from './TextInput';

import { buttonStrings } from '../localization';
import globalStyles from '../globalStyles';

/**
 * Renders a View containing a TextInput and confirm Button, to allow editing
 * of the text passed in as a prop.
 * @prop {string}   text            The text in its initial state
 * @prop {function} onEndEditing    A function to call with the new text on confirm.
 * @prop {Bool}     secureTextEntry Indicator if secure text entry should be used.
 */
const TextEditor = ({ onEndEditing, secureTextEntry, text }) => {
  const [textValue, setTextValue] = React.useState(text);

  const submitValue = React.useCallback(() => onEndEditing(textValue));

  return (
    <View style={localStyles.container}>
      <TextInput
        autoFocus={true}
        style={localStyles.textInput}
        textStyle={globalStyles.modalText}
        underlineColorAndroid="transparent"
        value={textValue}
        onChangeText={setTextValue}
        onSubmitEditing={submitValue}
        secureTextEntry={secureTextEntry}
      />
      <Button
        style={localStyles.confirmButtonStyle}
        textStyle={localStyles.confirmButtonTextStyle}
        text={buttonStrings.done}
        onPress={submitValue}
      />
    </View>
  );
};

export default TextEditor;

TextEditor.defaultProps = {
  text: '',
  secureTextEntry: false,
};

TextEditor.propTypes = {
  text: PropTypes.string,
  onEndEditing: PropTypes.func.isRequired,
  secureTextEntry: PropTypes.bool,
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginRight: 10,
  },
  confirmButtonStyle: {
    ...globalStyles.button,
    ...globalStyles.modalOrangeButton,
  },
  confirmButtonTextStyle: {
    ...globalStyles.buttonText,
    ...globalStyles.modalButtonText,
  },
});
