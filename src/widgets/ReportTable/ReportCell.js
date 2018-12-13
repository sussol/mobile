/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { APP_FONT_FAMILY, BACKGROUND_COLOR } from '../../globalStyles';

/**
 * Designed to be used in conjunction with ReportTable.
 * @prop  {int}      key        Identifier - Cell index within the row).
 * @prop  {bool}     even       Identifier for the row being even or odd within the FlatList.
 * @prop  {string}   children   Content to display.
 */

export class ReportCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: null,
    };
  }

  onLayout = event => {
    this.setState({
      width: event.nativeEvent.layout.width,
    });
  };

  render() {
    const content =
      this.props.children.length > this.state.width / 4
        ? this.props.children.slice(0, this.state.width / 6) + '...'
        : this.props.children;
    const style = this.props.even ? { backgroundColor: 'white' } : null;
    return (
      <View style={[localStyles.container, style]} onLayout={this.onLayout}>
        <Text style={[style, localStyles.cell]}>{content}</Text>
      </View>
    );
  }
}

ReportCell.propTypes = {
  key: PropTypes.number.isRequired,
  even: PropTypes.bool,
  children: PropTypes.string.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    backgroundColor: BACKGROUND_COLOR,
    marginRight: 1,
  },
  cell: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
  },
});

ReportCell.propTypes = {
  even: PropTypes.bool.isRequired,
};
