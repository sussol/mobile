/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Text, TouchableOpacity, View } from 'react-native';

import globalStyles from '../globalStyles';
import { navStrings } from '../localization';
import { ConfirmIcon, LockIcon } from './icons';

export const FinaliseButton = ({ isFinalised, onPress }) => {
  const Container = isFinalised ? View : TouchableOpacity;

  return (
    <Container onPress={onPress} style={globalStyles.navBarRightContainer}>
      <Text style={globalStyles.navBarText}>
        {isFinalised ? navStrings.finalised_cannot_be_edited : navStrings.finalise}
      </Text>
      {isFinalised ? <LockIcon /> : <ConfirmIcon />}
    </Container>
  );
};

export default FinaliseButton;

FinaliseButton.propTypes = {
  isFinalised: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
};
