/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import { APP_FONT_FAMILY, GREY, WARMER_GREY, SUSSOL_ORANGE } from '../../globalStyles';

export const ReportSideBarItem = props => {
  const { isLastItem, isSelected, content, subContent, icon } = props;

  const CONTENT_COLOR = {
    selected: SUSSOL_ORANGE,
    unselected: WARMER_GREY,
  };

  // Translations between icon props and names of FontAwesome icons.
  const TYPE_TO_ICON = {
    PieChart: 'pie-chart',
    LineChart: 'line-chart',
    Table: 'table',
    BarChart: 'bar-chart',
  };

  const { borderTopWidth, borderTopColor } = localStyles.FlatListItem;
  const contentColor = isSelected ? CONTENT_COLOR.selected : CONTENT_COLOR.unselected;
  const bottomBorder = isLastItem
    ? { borderBottomWidth: borderTopWidth, borderBottomColor: borderTopColor }
    : null;

  const onPressItem = () => {
    const { onPress, index } = props;
    onPress(index);
  };

  return (
    <TouchableOpacity onPress={onPressItem}>
      <View style={[localStyles.FlatListItem, bottomBorder]}>
        <View style={localStyles.ContentContainer}>
          <Text style={[localStyles.Content, { color: contentColor }]}>{content}</Text>
          <Text style={[localStyles.SubContent, { color: contentColor }]}>{subContent}</Text>
        </View>
        <Icon name={TYPE_TO_ICON[icon]} style={localStyles.Icon} color={contentColor} />
      </View>
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  FlatListItem: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: GREY,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 85,
  },
  ContentContainer: {
    flexDirection: 'column',
    width: '80%',
  },
  Content: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  SubContent: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: WARMER_GREY,
  },
  Icon: {
    fontSize: 18,
  },
});

ReportSideBarItem.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  isLastItem: PropTypes.bool.isRequired,
  onPress: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  content: PropTypes.string.isRequired,
  subContent: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
};
