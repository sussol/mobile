/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

export default function HeaderCell(props) {
  const { style, textStyle, width, onPress, text, ...containerProps } = props;
  if (typeof onPress === 'function') {
    return (
      <TouchableOpacity
        {...containerProps}
        style={[defaultStyles.headerCell, style, { flex: width }]}
        onPress={onPress}
      >
        <Text style={textStyle}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }
  return (
    <View {...containerProps} style={[defaultStyles.headerCell, style, { flex: width }]}>
      <Text style={textStyle}>
        {text}
      </Text>
    </View>
  );
}

HeaderCell.propTypes = {
  style: React.PropTypes.number,
  textStyle: React.PropTypes.number,
  width: React.PropTypes.number,
  onPress: React.PropTypes.func,
  text: React.PropTypes.string,
};

HeaderCell.defaultProps = {
  width: 1,
};

const defaultStyles = StyleSheet.create({
  headerCell: {
    flex: 1,
    justifyContent: 'center',
  },
});
