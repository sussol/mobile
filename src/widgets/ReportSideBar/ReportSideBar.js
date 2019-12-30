/* eslint-disable react/prop-types */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { APP_FONT_FAMILY, GREY } from '../../globalStyles';
import { ReportSideBarItem } from './ReportSideBarItem';

export const ReportSideBar = ({ reports, currentReport, onPressItem, dimensions }) => {
  const renderItem = ({ item }) => {
    const { id, index, title, type, date } = item;
    return (
      <ReportSideBarItem
        id={id}
        index={index}
        onPress={onPressItem}
        isLastItem={index + 1 === reports.length}
        isSelected={id === currentReport.id}
        icon={type}
        content={title}
        subContent={date}
      />
    );
  };

  const renderHeader = () => (
    <View>
      <Text style={localStyles.ListViewHeader}>Reports</Text>
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
});

ReportSideBar.propTypes = {
  reports: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  onPressItem: PropTypes.func.isRequired,
  dimensions: PropTypes.object.isRequired,
  currentReport: PropTypes.object.isRequired,
};
