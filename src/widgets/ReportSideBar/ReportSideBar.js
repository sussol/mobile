/* eslint-disable react/prop-types */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, FlatList, Text, StyleSheet } from 'react-native';

import { ReportSideBarItem } from './ReportSideBarItem';

import { DARKER_GREY, SUSSOL_ORANGE, WARMER_GREY, APP_FONT_FAMILY, GREY } from '../../globalStyles';

import { generalStrings } from '../../localization';

export const ReportSideBar = ({ reports, currentReport, onPressItem, dimensions }) => {
  const renderItem = ({ item }) => {
    const { id, index, title, type, date } = item;
    const isSelected = id === currentReport.id;
    return (
      <ReportSideBarItem
        id={id}
        index={index}
        onPress={onPressItem}
        icon={type}
        content={title}
        subContent={date}
        iconStyle={isSelected ? localStyles.selectedIcon : localStyles.icon}
        contentStyle={isSelected ? localStyles.selectedContent : localStyles.content}
      />
    );
  };

  const renderHeader = () => (
    <View>
      <Text style={localStyles.ListViewHeader}>{generalStrings.reports}</Text>
    </View>
  );

  return (
    <View style={[localStyles.ListViewContainer, dimensions]}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={reports}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        extraData={reports}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  ListViewHeader: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 18,
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 5,
    color: GREY,
    minHeight: 50,
  },
  ListViewContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRightColor: GREY,
    borderRightWidth: 1,
    margin: 0,
  },
  content: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    textAlignVertical: 'center',
    color: DARKER_GREY,
  },
  selectedContent: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    textAlignVertical: 'center',
    color: SUSSOL_ORANGE,
  },
  icon: { fontSize: 18, color: WARMER_GREY },
  selectedIcon: { fontSize: 18, color: SUSSOL_ORANGE },
});

ReportSideBar.propTypes = {
  reports: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  onPressItem: PropTypes.func.isRequired,
  dimensions: PropTypes.object.isRequired,
  currentReport: PropTypes.object.isRequired,
};
