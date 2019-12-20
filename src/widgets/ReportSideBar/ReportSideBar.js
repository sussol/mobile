/* eslint-disable react/no-unused-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, ListItem, FlatList, Text, StyleSheet } from 'react-native';
import { APP_FONT_FAMILY, GREY } from '../../globalStyles';
import { pageInfoStrings } from '../../localization/pageInfoStrings';

export const ReportSideBar = ({ data, onPressItem, selectedItemIndex, dimensions }) => {
  const renderItem = ({ item }) => {
    const { id, index, title, type, date } = item;
    return (
      <ListItem
        id={id}
        index={index}
        onPress={onPressItem}
        isLastItem={index + 1 === data.length}
        isSelected={selectedItemIndex === index}
        icon={type}
        content={title}
        subContent={date}
      />
    );
  };

  const renderHeader = () => (
    <View>
      <Text style={localStyles.ListViewHeader}>{pageInfoStrings.reports}</Text>
    </View>
  );

  return (
    <View style={[localStyles.ListViewContainer, dimensions]}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={data}
        ReportSideBarItem={renderItem}
        keyExtractor={item => item.id}
        extraData={{ dimensions, onPressItem, selectedItemIndex, data }}
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
  item: PropTypes.objectOf(PropTypes.object).isRequired,
  data: PropTypes.PropTypes.shape([]).isRequired,
  onPressItem: PropTypes.func.isRequired,
  selectedItemIndex: PropTypes.number.isRequired,
  dimensions: PropTypes.objectOf(PropTypes.object).isRequired,
};
