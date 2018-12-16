/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { ListItem } from './ListItem';
import { APP_FONT_FAMILY, GREY } from '../../globalStyles';
import { pageInfoStrings } from '../../localization/pageInfoStrings';

/**
 * FlatList wrapper component to render a vertical, clickable sidebar. Each ListItem has a
 * Title, date and icon. The currently selected ListItem is highlighted SUSSOL_ORANGE.
 *
 * @prop    {array}            data             Array of objects with properties for each list item: title, date, index, id, type (icon type)
 * @prop    {func}             onPressItem      Action to take on pressing on an item.
 * @prop    {int}              selected         Index of the selected ListItem.
 * @prop    {object}           dimensions       Additional styles to apply to the parent container.
 */
export class ReportSidebar extends React.Component {
  renderItem = ({ item }) => {
    const { onPressItem, selectedItemIndex, data } = this.props;
    return (
      <ListItem
        id={item.id}
        index={item.index}
        onPress={onPressItem}
        isLastItem={item.index + 1 === data.length}
        isSelected={selectedItemIndex === item.index}
        icon={item.type}
        content={item.title}
        subContent={item.date}
      />
    );
  };

  renderHeader = () => {
    return (
      <View>
        <Text style={localStyles.ListViewHeader}>{pageInfoStrings.reports}</Text>
      </View>
    );
  };

  render() {
    return (
      <View style={[localStyles.ListViewContainer, this.props.dimensions]}>
        <FlatList
          data={this.props.data}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
          extraData={this.props}
          ListHeaderComponent={this.renderHeader}
        />
      </View>
    );
  }
}

ReportSidebar.propTypes = {
  data: PropTypes.array.isRequired,
  onPressItem: PropTypes.func,
  selected: PropTypes.number,
  dimensions: PropTypes.object,
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
