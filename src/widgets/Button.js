import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

export class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
    this.loadOnPress = this.loadOnPress.bind(this);
  }

  /**
   * Responds to a press by changing the button to its loading state, then calling
   * the onPress function passed in through props
   */
  loadOnPress() {
     // After isLoading is set, use a timeout to allow a render frame to process
     // and display the button's loading state before calling the onPress function
     // is called
    this.setState({ isLoading: true }, () => setTimeout(() => {
      this.props.onPress();
      this.setState({ isLoading: false });
    }, 1));
  }

  render() {
    const { disabledColor, isDisabled, loadingText, onPress, text, textStyle, style } = this.props;
    const { isLoading } = this.state;

    if (isDisabled || isLoading) {
      return (
        <View style={[style, { backgroundColor: disabledColor }]}>
          <Text style={textStyle}>{isLoading ? loadingText : text}</Text>
        </View>
      );
    }

    return (
      <TouchableHighlight
        style={style}
        underlayColor="#B5B5B5"
        onPress={loadingText ? this.loadOnPress : onPress}
      >
        <Text style={textStyle}>{text}</Text>
      </TouchableHighlight>
    );
  }
}

Button.propTypes = {
  style: View.propTypes.style,
  textStyle: Text.propTypes.style,
  onPress: React.PropTypes.func,
  text: React.PropTypes.string,
  loadingText: React.PropTypes.string,
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
