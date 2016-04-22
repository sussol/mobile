import React, {
  PropTypes,
  StyleSheet,
  Text,
  TouchableHighlight,
} from 'react-native';

export default function Button(props) {
  return (
    <TouchableHighlight
      style={styles.button}
      underlayColor="#B5B5B5"
      onPress={props.onPress}
    >
      <Text style={styles.buttonText}>{props.text}</Text>
    </TouchableHighlight>
  );
}

Button.propTypes = {
  onPress: PropTypes.func,
  text: PropTypes.string,
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
  },
});
