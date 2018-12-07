import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { APP_FONT_FAMILY, GREY, WARMER_GREY } from '../globalStyles';
import { SUSSOL_ORANGE } from '../globalStyles/index';

export class ListItem extends React.PureComponent {
  onPressItem = () => {
    this.props.onPress(this.props.id);
  };

  render() {
    const bottomBorder =
      this.props.id + 1 === this.props.numReports
        ? { borderBottomWidth: 1, borderBottomColor: GREY }
        : null;
    const selectedItem = this.props.selected ? { color: SUSSOL_ORANGE } : null;
    return (
      <TouchableOpacity onPress={this.onPressItem}>
        <View style={[localStyles.ListViewItem, bottomBorder]}>
          <Text style={[localStyles.ListViewItemTitle, selectedItem]}>{this.props.name}</Text>
          <Text style={[localStyles.ListViewItemLabel, selectedItem]}>{this.props.label}</Text>
          <Text style={[localStyles.ListViewItemLabel, selectedItem]}>{this.props.date}</Text>
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
  },
  ListViewItemTitle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  ListViewItemLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 10,
    color: WARMER_GREY,
  },
});

ListItem.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  numReports: PropTypes.number.isRequired,
};
