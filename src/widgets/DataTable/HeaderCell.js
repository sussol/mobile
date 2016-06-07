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

import Icon from 'react-native-vector-icons/FontAwesome';

export function HeaderCell(props) {
  const {
    style,
    textStyle,
    width,
    onPress,
    text,
    isSelected,
    isAscending,
    ...containerProps,
  } = props;

  function renderSortArrow() {
    if (isSelected) {
      // isAscending = true = a to z
      if (isAscending) return <Icon name="sort-asc" size={16} style={defaultStyles.icon} />;
      return <Icon name="sort-desc" size={16} style={defaultStyles.icon} />;
    }
    return <Icon name="sort" size={16} style={defaultStyles.icon} />;
  }

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
        {renderSortArrow()}
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
  isSelected: React.PropTypes.bool,
  isAscending: React.PropTypes.bool,
  style: React.View.propTypes.style,
  textStyle: React.Text.propTypes.style,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 10,
  },
});
