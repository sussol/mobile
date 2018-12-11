import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { APP_FONT_FAMILY, BACKGROUND_COLOR } from '../globalStyles';

export class ReportCell extends React.PureComponent {
  render() {
    let style;
    if (!(this.props.id % 2 !== 0)) {
      style = { backgroundColor: 'white' };
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
    justifyContent: 'center',
    paddingLeft: 20,
    backgroundColor: BACKGROUND_COLOR,
  },
  cell: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
  },
});

// TODO: PropTypes
