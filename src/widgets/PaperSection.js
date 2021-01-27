/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';

import { Paper } from './Paper';

import { APP_FONT_FAMILY, DARKER_GREY, BACKGROUND_COLOR } from '../globalStyles';

export const PaperSection = ({
  width,
  height,
  Header,
  children,
  headerText,
  headerContainerStyle,
  contentContainerStyle,
  paperStyle,
}) => {
  const InternalHeader = headerText ? (
    <Text style={localStyles.headerText}>{headerText}</Text>
  ) : (
    Header
  );

  return (
    <Paper width={width} height={height} style={[localStyles.paper, paperStyle && paperStyle]}>
      <View style={[localStyles.headerContainer, headerContainerStyle]}>{InternalHeader}</View>
      <View style={[localStyles.contentContainer, contentContainerStyle]}>{children}</View>
    </Paper>
  );
};

PaperSection.defaultProps = {
  width: null,
  height: null,
  children: null,
  Header: null,
  headerText: '',
  headerContainerStyle: {},
  contentContainerStyle: {},
  paperStyle: {},
};

PaperSection.propTypes = {
  Header: PropTypes.node,
  headerContainerStyle: PropTypes.object,
  contentContainerStyle: PropTypes.object,
  paperStyle: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  children: PropTypes.node,
  headerText: PropTypes.string,
};

const localStyles = StyleSheet.create({
  paper: {
    height: 40,
    paddingHorizontal: 20,
    margin: 20,
    flex: 1,
    justifyContent: 'center',
    alignContent: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  headerContainer: {
    flex: 1,
  },
  headerText: {
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
    fontSize: 13,
    textTransform: 'uppercase',
  },
});
