import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { APP_FONT_FAMILY, BACKGROUND_COLOR } from '../globalStyles';
import Icon from 'react-native-vector-icons/FontAwesome';

export class ReportCell extends React.PureComponent {
  //TODO: Refactor into sorting by asc & desc, changing icon
  // appropriately.
  sortBy = () => {
    this.props.sortBy(this.props.index);
  };

  renderIcon = () => {
    const { sortedBy, index } = this.props;
    if (sortedBy === index) null;
    return <Icon name="sort-desc" size={16} />;
  };

  render() {
    let style;
    if (!(this.props.id % 2 !== 0)) {
      style = { backgroundColor: 'white' };
    }
    if (this.props.canSort) {
      return (
        <View style={[localStyles.container, style]}>
          <Text style={[style, localStyles.cell]}>{this.props.children}</Text>
        </View>
      );
    }
    return (
      <View style={[localStyles.container, style]}>
        <Text style={[style, localStyles.cell]}>{this.props.children}</Text>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  container: {
    width: '50%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    backgroundColor: BACKGROUND_COLOR,
  },
  cell: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
  },
  iconStyle: {
    marginRight: 10,
  },
});

ReportCell.propTypes = {
  id: PropTypes.string.isRequired,
  key: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  canSort: PropTypes.bool.isRequired,
  sortBy: PropTypes.func,
  sortedBy: PropTypes.number,
};
