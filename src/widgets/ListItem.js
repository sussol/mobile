import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { APP_FONT_FAMILY, GREY, WARMER_GREY, BLUE_WHITE } from '../globalStyles';
import { SUSSOL_ORANGE, ROW_BLUE } from '../globalStyles/index';
import Icon from 'react-native-vector-icons/FontAwesome';

export class ListItem extends React.PureComponent {
  onPressItem = () => {
    this.props.onPress(this.props.id);
  };

  lookupTable = {
    PieChart: 'pie-chart',
    LineChart: 'line-chart',
    Table: 'table',
    BarChart: 'bar-chart',
  };

  render() {
    const bottomBorder =
      this.props.id + 1 === this.props.numReports
        ? { borderBottomWidth: 1, borderBottomColor: GREY }
        : null;
    const selectedItem = this.props.selected ? { color: SUSSOL_ORANGE } : null;
    const iconColour = this.props.selected ? SUSSOL_ORANGE : WARMER_GREY;
    return (
      <TouchableOpacity onPress={this.onPressItem}>
        <View style={[localStyles.ListViewItem, bottomBorder]}>
          <View style={{ flexDirection: 'column', width: '80%' }}>
            <Text style={[localStyles.ListViewItemTitle, selectedItem]}>{this.props.title}</Text>
            <Text style={[localStyles.ListViewItemLabel, selectedItem]}>{this.props.date}</Text>
          </View>
          <Icon name={this.lookupTable[this.props.type]} size={18} color={iconColour} />
        </View>
      </TouchableOpacity>
    );
  }
}

const localStyles = StyleSheet.create({
  ListViewItem: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: GREY,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ListViewItemTitle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    textAlignVertical: 'center',
  },
  ListViewItemLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 8,
    color: WARMER_GREY,
  },
});

ListItem.propTypes = {
  id: PropTypes.number.isRequired,
  reportID: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  numReports: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
};
