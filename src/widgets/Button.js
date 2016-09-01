import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

export function Button(props) {
  const { disabledColor, isDisabled, onPress, text, textStyle, style } = props;

  if (isDisabled) {
    return (
      <View style={[style, { backgroundColor: disabledColor }]}>
        <Text style={textStyle}>{text}</Text>
      </View>
    );
  }

  return (
    <TouchableHighlight
      style={style}
      underlayColor="#B5B5B5"
      onPress={onPress}
    >
      <Text style={textStyle}>{text}</Text>
    </TouchableHighlight>
  );
}

Button.propTypes = {
  style: View.propTypes.style,
  textStyle: Text.propTypes.style,
  onPress: React.PropTypes.func,
  text: React.PropTypes.string,
  isDisabled: React.PropTypes.bool,
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
