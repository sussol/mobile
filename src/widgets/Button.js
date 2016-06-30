import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

export function Button(props) {
  if (props.disabled) {
    return (
      <View style={[props.style, { backgroundColor: props.disabledColor }]}>
        <Text style={props.textStyle}>{props.text}</Text>
      </View>
    );
  }
  return (
    <TouchableHighlight
      style={props.style}
      underlayColor="#B5B5B5"
      onPress={() => {
        props.onPress();
      }}
    >
      <Text style={props.textStyle}>{props.text}</Text>
    </TouchableHighlight>
  );
}

Button.propTypes = {
  style: View.propTypes.style,
  textStyle: Text.propTypes.style,
  onPress: React.PropTypes.func,
  text: React.PropTypes.string,
  disabled: React.PropTypes.bool,
  disabledColor: React.PropTypes.string,
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
  },
});

Button.defaultProps = { // 'styles' needs to be declared before use!
  style: styles.button,
  textStyle: styles.buttonText,
};
