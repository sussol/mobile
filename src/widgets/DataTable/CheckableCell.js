/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  TouchableOpacity,
} from 'react-native';

export class CheckableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: false,
    };
    this.onPress = this.onPress.bind(this);
  }

  componentWillMount() {
    this.setState({
      isChecked: this.props.isChecked,
    });
  }

  onPress() {
    this.setState({ isChecked: !this.state.isChecked });
    this.props.onPress();
  }

  render() {
    const { style,
      width,
      renderIsChecked,
      renderIsNotChecked,
    } = this.props;

    return (
      <TouchableOpacity style={[style, { flex: width }]} onPress={() => this.onPress()}>
        {this.state.isChecked ? renderIsChecked : renderIsNotChecked}
      </TouchableOpacity>
    );
  }
}

CheckableCell.propTypes = {
  style: TouchableOpacity.propTypes.style,
  width: React.PropTypes.number,
  onPress: React.PropTypes.func,
  renderIsChecked: React.PropTypes.object,
  renderIsNotChecked: React.PropTypes.object,
  target: React.PropTypes.object,
  isChecked: React.PropTypes.bool,
};

CheckableCell.defaultProps = {
  width: 1,
  isChecked: false,
};
