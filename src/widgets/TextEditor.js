/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-ui-components';

import { TextInput } from './TextInput';

import { buttonStrings } from '../localization/index';
import globalStyles from '../globalStyles';

/**
 * Renders a View containing a TextInput and confirm Button, to allow editing
 * of the text passed in as a prop.
 * @prop {string}   text          The text in its initial state
 * @prop {function} onEndEditing  A function to call with the new text
 *                                on confirm
 */
export class TextEditor extends React.Component {
  constructor(props) {
    super(props);

    const { text } = this.props;

    this.state = {
      text,
    };
  }

  render() {
    const { onEndEditing, secureTextEntry } = this.props;
    const { text } = this.state;

    return (
      <View style={localStyles.container}>
        <TextInput
          autoFocus={true}
          style={localStyles.textInput}
          textStyle={globalStyles.modalText}
          underlineColorAndroid="transparent"
          value={text}
          onChangeText={newText => this.setState({ text: newText })}
          onSubmitEditing={() => onEndEditing(text)}
          secureTextEntry={secureTextEntry}
        />
        <Button
          style={[globalStyles.button, globalStyles.modalOrangeButton]}
          textStyle={[globalStyles.buttonText, globalStyles.modalButtonText]}
          text={buttonStrings.done}
          onPress={() => onEndEditing(text)}
        />
      </View>
    );
  }
}

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
});
