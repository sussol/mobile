import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { ListItem } from './ListItem';
import globalStyles, { APP_FONT_FAMILY, GREY } from '../globalStyles';

/**
 * FlatList wrapper component to render a vertical, clickable sidebar. Each ListItem has a
 * Title, date and icon. The currently selected ListItem is highlighted SUSSOL_ORANGE.
 * @prop   {array}               data        2d array of strings, each representing a cell.
 * @prop   {func}                onPressItem Action to take on pressing on an item.
 * @state  {Realm.Results}       items       Contains all Items stored on the local database.
 */
export class ReportSidebar extends React.Component {
  renderItem = ({ item }) => {
    return (
      <ListItem
        id={item.id}
        index={item.index}
        title={item.title}
        date={item.date}
        onPress={this.props.onPressItem}
        lastItem={item.index + 1 === this.props.data.length}
        selected={item.selected === item.id}
        icon={item.type}
      />
    );
  };

  renderHeader = () => {
    return (
      <View>
        <Text style={localStyles.ListViewHeader}>Reports</Text>
      </View>
    );
  };

  extractKey = item => {
    return item.id;
  };

  render() {
    const sideBarStyles = { width: '25%' }; // change to adjust from prop
    return (
      <View style={[localStyles.ListViewContainer, sideBarStyles]}>
        <FlatList
          data={this.props.data}
          renderItem={this.renderItem}
          keyExtractor={this.extractKey}
          ListHeaderComponent={this.renderHeader}
        />
      </View>
    );
  }
}

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
    height: '100%',
    margin: 0,
  },
});
