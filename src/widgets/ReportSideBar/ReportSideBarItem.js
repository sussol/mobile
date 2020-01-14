/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';

import { GREY } from '../../globalStyles';

// Translations between icon props and names of FontAwesome icons.
const TYPE_TO_ICON = {
  PieChart: 'pie-chart',
  LineChart: 'line-chart',
  Table: 'table',
  BarChart: 'bar-chart',
};

export const ReportSideBarItem = ({
  content,
  subContent,
  icon,
  onPress,
  id,
  contentStyle,
  iconStyle,
}) => {
  const onPressItem = React.useCallback(() => onPress(id), [id, onPress]);

  return (
    <TouchableOpacity onPress={onPressItem}>
      <View style={localStyles.flatListItem}>
        <View style={localStyles.contentContainer}>
          <Text style={contentStyle}>{content}</Text>
          <Text style={contentStyle}>{subContent}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Icon name={TYPE_TO_ICON[icon]} style={iconStyle} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  flatListItem: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: GREY,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 85,
  },
  contentContainer: {
    flexDirection: 'column',
    flex: 9,
  },
});

ReportSideBarItem.defaultProps = {
  subContent: '',
};

ReportSideBarItem.propTypes = {
  contentStyle: PropTypes.object.isRequired,
  iconStyle: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  content: PropTypes.string.isRequired,
  subContent: PropTypes.string,
  icon: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
