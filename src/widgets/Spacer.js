import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

export const Spacer = ({ vertical, space }) => {
  const widthOrHeight = vertical ? 'minHeight' : 'minWidth';

  const internalStyle = { [widthOrHeight]: space };

  return <View style={internalStyle} />;
};

Spacer.defaultProps = { vertical: false, space: 0 };

Spacer.propTypes = { vertical: PropTypes.bool, space: PropTypes.number };
