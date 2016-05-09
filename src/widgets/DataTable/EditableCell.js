/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  TextInput,
  View,
} from 'react-native';

export default class EditableCell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'N/A',
    };
    this.componentWillMount = this.componentWillMount.bind(this);
  }

  componentWillMount() {
    this.setState({
      value: String(this.props.value),
    });
  }

  onEndEditing() {
    this.props.onEndEditing(this.props.target, this.state.value);
  }

  render() {
    const { style, width, textStyle, ...textInputProps } = this.props;
    return (
      <View style={[style, { flex: width }]}>
        <TextInput
          {...textInputProps}
          style={textStyle}
          onChangeText = {(text) => this.setState({ value: text })}
          onEndEditing={() => this.onEndEditing()}
          value={this.state.value}
        />
      </View>
    );
  }
}

EditableCell.propTypes = {
  style: React.PropTypes.number,
  textStyle: React.PropTypes.number,
  width: React.PropTypes.number,
  onEndEditing: React.PropTypes.func,
  target: React.PropTypes.object,
  value: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
};

EditableCell.defaultProps = {
  width: 1,
  value: 'N/A',
};
