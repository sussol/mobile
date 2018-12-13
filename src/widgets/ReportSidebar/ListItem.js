/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { APP_FONT_FAMILY, GREY, WARMER_GREY } from '../../globalStyles';
import { SUSSOL_ORANGE } from '../../globalStyles/index';
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * Component designed to be used in conjunction with ReportSidebar as the rendered items.
 *
 * @prop  {int}     id          Unique identifier for the item.
 * @prop  {index}   index       Index of the item within the FlatList.
 * @prop  {title}   selected    Indicator of if this is the currently selected item within the list.
 * @prop  {func}    onPress     Function to call on touch, passing the index of the item as a parameter.
 * @prop  {bool}    lastItem    Indicator of whether this is the last item in the list, adding a bottom seperator if true.
 * @prop  {string}  icon        String indicating the type of icon to display (FontAwesome).
 * @prop  {string}  content     Main content to display within the ListItem.
 * @prop  {string}  subContent  Sub content to display under the main content.
 */

export class ListItem extends React.PureComponent {
  // Translations between icon props and names of FontAwesome icons.
  TYPE_TO_ICON = {
    PieChart: 'pie-chart',
    LineChart: 'line-chart',
    Table: 'table',
    BarChart: 'bar-chart',
  };

  onPressItem = () => {
    this.props.onPress(this.props.index);
  };

  render() {
    const hasBottomBorder = this.props.isLastItem
      ? { borderBottomWidth: 1, borderBottomColor: GREY }
      : null;
    const isSelected = this.props.selected ? { color: SUSSOL_ORANGE } : null;
    const iconColour = this.props.selected ? SUSSOL_ORANGE : WARMER_GREY;
    return (
      <TouchableOpacity onPress={this.onPressItem}>
        <View style={[localStyles.FlatListItem, hasBottomBorder]}>
          <View style={{ flexDirection: 'column', width: '80%' }}>
            <Text style={[localStyles.Content, isSelected]}>{this.props.content}</Text>
            <Text style={[localStyles.SubContent, isSelected]}>{this.props.subContent}</Text>
          </View>
          <Icon name={this.TYPE_TO_ICON[this.props.icon]} size={18} color={iconColour} />
        </View>
      </TouchableOpacity>
    );
  }
}

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
});

ListItem.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  title: PropTypes.string,
  date: PropTypes.string,
  onPress: PropTypes.func,
  selected: PropTypes.bool,
  icon: PropTypes.string,
};
