/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Text, TouchableOpacity, View } from 'react-native';

import { ConfirmIcon, LockIcon } from './icons';
import { selectFinaliseItemIsFinalised } from '../selectors/finalise';
import { FinaliseActions } from '../actions/FinaliseActions';

import { navStrings } from '../localization';
import globalStyles from '../globalStyles';

const mapStateToProps = state => {
  const isFinalised = selectFinaliseItemIsFinalised(state);
  return { isFinalised };
};

const FinaliseButtonComponent = ({ isFinalised, openFinaliseModal }) => {
  const Container = isFinalised ? View : TouchableOpacity;

  return (
    <Container onPress={openFinaliseModal} style={globalStyles.navBarRightContainer}>
      <Text style={globalStyles.navBarText}>
        {isFinalised ? navStrings.finalised_cannot_be_edited : navStrings.finalise}
      </Text>
      {isFinalised ? <LockIcon /> : <ConfirmIcon />}
    </Container>
  );
};

const mapDispatchToProps = dispatch => {
  const openFinaliseModal = () => dispatch(FinaliseActions.openModal());

  return { openFinaliseModal };
};

FinaliseButtonComponent.propTypes = {
  isFinalised: PropTypes.bool.isRequired,
  openFinaliseModal: PropTypes.func.isRequired,
};

export const FinaliseButton = connect(mapStateToProps, mapDispatchToProps)(FinaliseButtonComponent);
