/* @flow weak */

/**
 * OfflineMobile Cell component
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function Cell(props) {
  const { children, style, textStyle, width, ...viewProps } = props;
  return (
    <View {...viewProps} style={[defaultStyles.cell, style, { flex: width }]}>
      <Text style={textStyle}>
        {children}
      </Text>
    </View>
  );
}

Cell.propTypes = {
  style: React.PropTypes.number,
  width: React.PropTypes.number,
  textStyle: React.PropTypes.number,
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
