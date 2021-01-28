/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';

import { WHITE, DARKER_GREY, BACKGROUND_COLOR, APP_FONT_FAMILY } from '../globalStyles';

export const Paper = ({
  width,
  height,
  paddingHorizontal,
  Header,
  headerText,
  headerContainerStyle,
  contentContainerStyle,
  children,
  style,
}) => {
  let internalContainerStyle = [localStyles.container, style];
  if (width) internalContainerStyle = [localStyles.container, { width }];
  if (height) internalContainerStyle = [localStyles.container, { height }];

  const InternalHeader =
    Header || (headerText && <Text style={localStyles.headerText}>{headerText}</Text>);

  return (
    <View style={internalContainerStyle}>
      {InternalHeader && (
        <View style={[localStyles.headerContainer, { paddingHorizontal }, headerContainerStyle]}>
          {InternalHeader}
        </View>
      )}
      <View style={[localStyles.contentContainer, { paddingHorizontal }, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    margin: 5, // Need some margin to accomodate shadow (elevation prop)
    marginVertical: 15,
    elevation: 2,
    borderRadius: 4,
    backgroundColor: WHITE,
  },
  headerContainer: {
    flex: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  headerText: {
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
    fontSize: 13,
    textTransform: 'uppercase',
  },
});

Paper.defaultProps = {
  width: null,
  height: null,
  paddingHorizontal: 10,
  style: {},
  headerContainerStyle: {},
  contentContainerStyle: {},
  Header: null,
  headerText: null,
  children: null,
};

Paper.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  paddingHorizontal: PropTypes.number,
  style: PropTypes.object,
  contentContainerStyle: PropTypes.object,
  Header: PropTypes.node,
  headerText: PropTypes.string,
  headerContainerStyle: PropTypes.object,
  children: PropTypes.node,
};
