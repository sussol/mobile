/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import {
  Button,
  TextInput,
} from './index';
import globalStyles from '../globalStyles';

/**
 * Renders a View containing a TextInput and confirm Button, to allow editing
 * of the text passed in as a prop.
 * @prop {string}   text          The text in its initial state
 * @prop {function} onEndEditing  A function to call with the new text on confirm
 */
export class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text,
    };
  }

  render() {
    return (
      <View style={localStyles.container}>
        <TextInput
          autoFocus={true}
          style={localStyles.textInput}
          textStyle={globalStyles.modalText}
          underlineColorAndroid="transparent"
          value={this.state.text}
          onChangeText={(text) => this.setState({ text: text })}
          onSubmitEditing={() => this.props.onEndEditing(this.state.text)}
        />
        <Button
          style={[globalStyles.button, globalStyles.modalOrangeButton]}
          textStyle={[globalStyles.buttonText, globalStyles.modalButtonText]}
          text="Done"
          onPress={() => this.props.onEndEditing(this.state.text)}
        />
      </View>
    );
  }
}

TextEditor.propTypes = {
  text: React.PropTypes.string,
  onEndEditing: React.PropTypes.func,
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
