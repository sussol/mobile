/* eslint-disable react/forbid-prop-types */
/* eslint-disable arrow-body-style */
import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';

import { FlexRow } from './FlexRow';
import { SpacedChildren, Spacer } from './Spacer';
import { WithFixedDimensions } from './WithFixedDimensions';

import { APP_FONT_FAMILY, DARKER_GREY, WHITE } from '../globalStyles';

export const EditorRow = ({ children, label = '', Icon, containerStyle, labelStyle }) => {
  return (
    <FlexRow flex={1} alignItems="center" justifyContent="flex-start" style={containerStyle}>
      <WithFixedDimensions width={30}>{Icon}</WithFixedDimensions>
      <Spacer space={20} />
      <Text style={labelStyle}>{label}</Text>
      <SpacedChildren space={0}>{children}</SpacedChildren>
    </FlexRow>
  );
};

EditorRow.defaultProps = {
  containerStyle: { maxHeight: 60, backgroundColor: WHITE },
  labelStyle: {
    fontSize: 12,
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
    marginRight: 'auto',
    width: 120,
  },
};

EditorRow.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  Icon: PropTypes.node.isRequired,
  containerStyle: PropTypes.object,
  labelStyle: PropTypes.object,
};
