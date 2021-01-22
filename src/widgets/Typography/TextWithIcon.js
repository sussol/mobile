/* eslint-disable react/forbid-prop-types */
/* eslint-disable arrow-body-style */
import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';

import { FlexRow } from '../FlexRow';

import { APP_FONT_FAMILY, DARKER_GREY } from '../../globalStyles';

const SIZES = {
  xs: 10,
  s: 12,
  ms: 13,
  m: 14,
  ml: 16,
  l: 20,
};

const getInternalStyle = (size, left, color, textStyle) => {
  const margin = left ? 'marginLeft' : 'marginRight';
  const alignment = left ? 'left' : 'right';

  const styleAdjustment = {
    fontSize: SIZES[size],
    [margin]: 5,
    textAlign: alignment,
    color,
    ...textStyle,
  };

  return [defaultStyle, styleAdjustment];
};

export const TextWithIcon = ({ Icon, left, children, color, size, containerStyle, textStyle }) => {
  const internalStyle = getInternalStyle(size, left, color, textStyle);

  return (
    <FlexRow alignItems="center" flex={1} style={containerStyle}>
      {left ? Icon : null}
      <Text style={internalStyle}>{children}</Text>
      {!left ? Icon : null}
    </FlexRow>
  );
};

const defaultStyle = { fontFamily: APP_FONT_FAMILY };

TextWithIcon.defaultProps = {
  left: false,
  color: DARKER_GREY,
  size: 'xs',
  containerStyle: {},
  textStyle: {},
};

TextWithIcon.propTypes = {
  Icon: PropTypes.node.isRequired,
  left: PropTypes.bool,
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  size: PropTypes.string,
  containerStyle: PropTypes.object,
  textStyle: PropTypes.object,
};
