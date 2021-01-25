/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';

import { Paper } from './Paper';

import { APP_FONT_FAMILY, DARKER_GREY, BACKGROUND_COLOR } from '../globalStyles';

const defaultHeaderStyle = { fontFamily: APP_FONT_FAMILY, color: DARKER_GREY, fontSize: 13 };
const getDefaultHeader = text => <Text style={defaultHeaderStyle}>{text}</Text>;

export const PaperSection = ({
  width,
  height,
  Header,
  children,
  headerText,
  innerPadding,
  headerContainerStyle,
  contentContainerStyle,
}) => {
  const InternalHeader = headerText ? getDefaultHeader(headerText) : Header;

  // Pad the content and header if passed, keeping them in sync.
  const internalContentStyle = { ...contentContainerStyle, padding: innerPadding };
  const internalHeaderContainerStyle = { ...headerContainerStyle, padding: innerPadding };

  return (
    <Paper width={width} height={height}>
      <View style={internalHeaderContainerStyle}>{InternalHeader}</View>
      <View style={internalContentStyle}>{children}</View>
    </Paper>
  );
};

PaperSection.defaultProps = {
  width: 0,
  height: 0,
  innerPadding: 20,
  children: null,
  Header: null,
  headerText: '',
  headerContainerStyle: {
    height: 40,
    display: 'flex',
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: BACKGROUND_COLOR,
    padding: 10,
  },
  contentContainerStyle: { flex: 1 },
};

PaperSection.propTypes = {
  Header: PropTypes.node,
  innerPadding: PropTypes.number,
  headerContainerStyle: PropTypes.object,
  contentContainerStyle: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  children: PropTypes.node,
  headerText: PropTypes.string,
};
