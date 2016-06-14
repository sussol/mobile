/* @flow weak */

/**
 * OfflineMobile Cell component
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

/**
 * Renders a headerCell that supports being a plain View with Text or being a TouchableOpacity (with
 * callback). In the latter case Sort arrows will be rendered and controlled with isSelected and
 * isAscending props.
 * @param   {object}  props         Properties passed where component was created.
 * @prop    {StyleSheet} style      Style of the headerCell (View props)
 * @prop    {StyleSheet} textStyle  Style of the text in the HeaderCell
 * @prop    {number} width          flexbox flex property, gives weight to the headerCell width
 * @prop    {func} onPress          CallBack (i.e. should change sort order in parent)
 * @prop    {string}  text          Text to render in headerCell
 * @return  {React.Component}       Return TouchableOpacity with sort arrows if onPress is given a
 *                                  function. Otherwise return a View.
 */
export function Cell(props) {
  const { style, textStyle, width, children, ...viewProps } = props;

  if (typeof children !== 'string') {
    return (
      <View {...viewProps} style={[defaultStyles.cell, style, { flex: width }]}>
        {children}
      </View>
    );
  }

  return (
    <View {...viewProps} style={[defaultStyles.cell, style, { flex: width }]}>
      <Text style={textStyle}>
        {children}
      </Text>
    </View>
  );
}

Cell.propTypes = {
  style: View.propTypes.style,
  textStyle: Text.propTypes.style,
  width: React.PropTypes.number,
  children: React.PropTypes.any,
};

Cell.defaultProps = {
  width: 1,
};

const defaultStyles = StyleSheet.create({
  cell: {
    flex: 1,
    justifyContent: 'center',
  },
});
