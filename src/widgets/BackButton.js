/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, BackHandler } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { debounce } from '../utilities';
import { UIDatabase } from '../database';
import { getRouteTitle, RootNavigator } from '../navigation';
import { PrescriptionActions } from '../actions/PrescriptionActions';
import { goBack } from '../navigation/actions';

import { BackIcon } from './icons';
import { FlexRow } from './FlexRow';

import { textStyles } from '../globalStyles';

const mapStateToProps = state => {
  const { pages = {} } = state;
  const { currentRoute = '' } = pages;
  const { [currentRoute]: currentPageState = {} } = pages;
  const { pageObject } = currentPageState;

  return { title: getRouteTitle(pageObject, currentRoute) };
};

const mapDispatchToProps = dispatch => {
  const deletePrescriptions = () => dispatch(PrescriptionActions.deletePrescription());
  const onBack = () => dispatch(goBack());

  return { deletePrescriptions, onBack };
};

export const BackButtonComponent = ({ title, deletePrescriptions, onBack }) => {
  const handleBackEvent = () => {
    UIDatabase.write(() => {
      const prescriptions = UIDatabase.objects('Prescription').filtered('status != "finalised"');
      UIDatabase.delete('Transaction', prescriptions);
      deletePrescriptions();
    });

    if (!RootNavigator.canGoBack()) BackHandler.exitApp();
    else onBack();
  };

  const debouncedBackEventHandler = React.useCallback(debounce(handleBackEvent, 5000, true), []);

  return (
    <TouchableOpacity onPress={debouncedBackEventHandler}>
      <FlexRow flex={1} justifyContent="center" alignItems="center">
        {RootNavigator.canGoBack() && <BackIcon />}
        <Text style={localStyles.title}>{title}</Text>
      </FlexRow>
    </TouchableOpacity>
  );
};

BackButtonComponent.propTypes = {
  deletePrescriptions: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

const localStyles = StyleSheet.create({ title: { ...textStyles, marginLeft: 30 } });

export const BackButton = connect(mapStateToProps, mapDispatchToProps)(BackButtonComponent);
