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
  }

  async onPress() {
    // By definition, the second argument should be called after rerender (doesn't appear to)
    await this.setState({ isLoading: true }, this.props.onPress);
    this.setState({ isLoading: false });
  }

  render() {
    const props = this.props;
    if (props.isDisabled) {
      return (
        <View style={[props.style, { backgroundColor: props.disabledColor }]}>
          <Text style={props.textStyle}>{props.text}</Text>
        </View>
      );
    }
    if (this.state.isLoading) {
      return (
        <View style={[props.style, { backgroundColor: props.disabledColor }]}>
          <Text style={props.textStyle}>Working</Text>
        </View>
      );
    }

    return (
      <TouchableHighlight
        style={props.style}
        underlayColor="#B5B5B5"
        onPress={() => { this.onPress(); }}
      >
        <Text style={props.textStyle}>{props.text}</Text>
      </TouchableHighlight>
    );
  }
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
