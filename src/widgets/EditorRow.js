/* eslint-disable react/forbid-prop-types */
/* eslint-disable arrow-body-style */
import React from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';

import { FlexRow } from './FlexRow';
import { SpacedChildren, Spacer } from './Spacer';
import { WithFixedDimensions } from './WithFixedDimensions';

import { APP_FONT_FAMILY, DARKER_GREY } from '../globalStyles';

export const EditorRow = ({ children, label, Icon, containerStyle, labelStyle }) => {
  return (
    <FlexRow alignItems="center" style={[localStyles.containerStyle, containerStyle]}>
      <WithFixedDimensions width={20}>{Icon}</WithFixedDimensions>
      <Spacer space={20} />
      <Text style={[localStyles.labelStyle, labelStyle]}>{label}</Text>
      <SpacedChildren space={0}>{children}</SpacedChildren>
    </FlexRow>
  );
};
EditorRow.defaultProps = {
  containerStyle: {},
  labelStyle: {},
};
EditorRow.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  Icon: PropTypes.node.isRequired,
  containerStyle: PropTypes.object,
  labelStyle: PropTypes.object,
};

const localStyles = StyleSheet.create({
  containerStyle: { padding: 5 },
  labelStyle: {
    fontSize: 12,
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
    marginRight: 'auto',
  },
});
