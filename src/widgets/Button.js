import React, {
  PropTypes,
  StyleSheet,
  Text,
  TouchableHighlight,
} from 'react-native';

export default function Button(props) {
  return (
    <TouchableHighlight
      style={props.style}
      underlayColor="#B5B5B5"
      onPress={() => {
        props.onPress();
      }}
    >
      <Text style={styles.textStyle}>{props.text}</Text>
    </TouchableHighlight>
  );
}

Button.propTypes = {
  style: React.View.propTypes.style,
  textStyle: React.Text.propTypes.style,
  onPress: PropTypes.func,
  text: PropTypes.string,
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'blue',
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
};
