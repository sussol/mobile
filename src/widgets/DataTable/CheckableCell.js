/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';

/**
 * Renders a CheckableCell that renders either renderIsChecked or renderIsNotChecked when isChecked
 * is true or false respectively. Whole cell returned is pressable. Callback should affect state of
 * Parent in some way that keeps the state of parent in sync with state of the CheckableCell. Kept
 * separate to maintain responsiveness of the cell.
 * @param   {object}  props             Properties passed where component was created.
 * @prop    {StyleSheet} style          Style of the CheckableCell (View props).
 * @prop    {number} width              flexbox flex property, gives weight to the CheckableCell width
 * @prop    {object} renderIsChecked    Object is rendered as child in CheckableCell if checked.
 * @prop    {object} renderIsNotChecked Object is rendered as child in CheckableCell if notchecked.
 * @prop    {boolean} isChecked         controls the isChecked state of the CheckableCell.
 * @return  {React.Component}           Return TouchableOpacity with child rendered according to the
 *                                      above 3 props.
 */
export class CheckableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: false,
    };
    this.onPress = this.onPress.bind(this);
  }

  componentWillMount() {
    this.setState({ isChecked: this.props.isChecked });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ isChecked: nextProps.isChecked });
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
  style: View.propTypes.style,
  width: React.PropTypes.number,
  onPress: React.PropTypes.func,
  renderIsChecked: React.PropTypes.object,
  renderIsNotChecked: React.PropTypes.object,
  isChecked: React.PropTypes.bool,
};

CheckableCell.defaultProps = {
  width: 1,
  isChecked: false,
};
