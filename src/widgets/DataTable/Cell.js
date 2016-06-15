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
 * Renders a Cell that supports being a string as children, or any component.
 * @param   {object}  props         Properties passed where component was created.
 * @prop    {StyleSheet} style      Style of the Cell (View props)
 * @prop    {StyleSheet} textStyle  Style of the text in the Cell
 * @prop    {number} width          Flexbox flex property, gives weight to the Cell width
 * @prop    {string}  text          Text to render in Cell
 * @return  {React.Component}       A single View with children
 */
export function Cell(props) {
  const { style, textStyle, width, children, ...viewProps } = props;

  // Render string child in a Text Component
  if (typeof children === 'string') {
    return (
      <View {...viewProps} style={[defaultStyles.cell, style, { flex: width }]}>
        <Text style={textStyle}>
          {children}
        </Text>
      </View>
    );
  }
  // Render any type of child component(s)
  return (
    <View {...viewProps} style={[defaultStyles.cell, style, { flex: width }]}>
      {children}
    </View>
  );
}

Cell.propTypes = {
  ...View.propTypes,
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
