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
 * @prop    {number} width              Flexbox flex property, gives weight to the CheckableCell width
 * @prop    {object} renderIsChecked    Object is rendered as child in CheckableCell if checked.
 * @prop    {object} renderIsNotChecked Object is rendered as child in CheckableCell if notchecked.
 * @prop    {boolean} isChecked         Used to set the initial state of the cell when the
 *                                      component mounts or rerenders (e.g. table sort
 *                                      order change).
 * @return  {React.Component}           Return TouchableOpacity with child rendered according to the
 *                                      above 3 props.
 */
export function CheckableCell(props) {
  const {
    isDisabled,
    style,
    width,
    renderDisabled,
    renderIsChecked,
    renderIsNotChecked,
    isChecked,
    onPress,
  } = props;

  if (isDisabled) {
    let renderFunction = renderDisabled;
    if (!renderFunction) {
      renderFunction = isChecked ? renderIsChecked : renderIsNotChecked;
    }
    return (
      <View style={[style, { flex: width }]} >
        {renderFunction()}
      </View>
    );
  }

  return (
    <TouchableOpacity style={[style, { flex: width }]} onPress={() => onPress()}>
      {isChecked ? renderIsChecked() : renderIsNotChecked()}
    </TouchableOpacity>
  );
}

CheckableCell.propTypes = {
  style: View.propTypes.style,
  width: React.PropTypes.number,
  onPress: React.PropTypes.func,
  renderDisabled: React.PropTypes.func,
  renderIsChecked: React.PropTypes.func,
  renderIsNotChecked: React.PropTypes.func,
  isChecked: React.PropTypes.bool,
  isDisabled: React.PropTypes.bool,
};

CheckableCell.defaultProps = {
  width: 1,
  isChecked: false,
};
