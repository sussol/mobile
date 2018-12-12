import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { APP_FONT_FAMILY, BACKGROUND_COLOR } from '../globalStyles';

export const ReportCell = props => {
  const style = props.even ? { backgroundColor: 'white' } : null;
  return (
    <View style={[localStyles.container, style]}>
      <Text style={[style, localStyles.cell]}>{props.children}</Text>
    </View>
  );
};

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
});

ReportCell.propTypes = {
  even: PropTypes.bool.isRequired,
};
