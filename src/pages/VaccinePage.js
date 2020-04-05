/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { FridgeDisplay, FlexView } from '../widgets';

import { selectMinAndMaxLogs, selectMinAndMaxDomains } from '../selectors/fridge';
import { FridgeActions } from '../actions/FridgeActions';
import { BreachActions } from '../actions/BreachActions';

import { APP_FONT_FAMILY } from '../globalStyles';
import { vaccineStrings } from '../localization';

export const VaccinePageComponent = ({
  selectedFridge,
  minLine,
  maxLine,
  breaches,
  maxDomain,
  minDomain,
  fridges,
  onSelectFridge,
  onOpenBreachModal,
}) => {
  const Fridge = React.useCallback(
    ({ item }) => (
      <FridgeDisplay
        fridge={item}
        minLine={minLine}
        maxLine={maxLine}
        breaches={breaches}
        maxDomain={maxDomain}
        minDomain={minDomain}
        onSelectFridge={onSelectFridge}
        isActive={item.id === selectedFridge.id}
        onOpenBreachModal={onOpenBreachModal}
      />
    ),
    minLine,
    maxLine,
    breaches,
    maxDomain,
    minDomain,
    onSelectFridge
  );

  const BlankComponent = React.useCallback(
    () => (
      <FlexView flex={1} justifyContent="center" alignItems="center">
        <Text style={localStyles.blankText}>{vaccineStrings.no_fridges}</Text>
      </FlexView>
    ),
    []
  );

  return fridges.length ? <FlatList data={fridges} renderItem={Fridge} /> : <BlankComponent />;
};

const mapStateToProps = state => {
  const { fridge } = state;
  const { fridges, selectedFridge } = fridge;
  const { breaches } = selectedFridge;

  const { minLine, maxLine } = selectMinAndMaxLogs(state);
  const { minDomain, maxDomain } = selectMinAndMaxDomains(state);
  return {
    minLine,
    maxLine,
    minDomain,
    maxDomain,
    fridges,
    selectedFridge,
    breaches,
  };
};

const mapDispatchToProps = dispatch => ({
  onSelectFridge: fridge => dispatch(FridgeActions.select(fridge)),
  onOpenBreachModal: breachId => {
    dispatch(BreachActions.setFridgeBreach(breachId));
  },
});

VaccinePageComponent.defaultProps = {
  breaches: [],
};

VaccinePageComponent.propTypes = {
  selectedFridge: PropTypes.object.isRequired,
  minLine: PropTypes.array.isRequired,
  maxLine: PropTypes.array.isRequired,
  breaches: PropTypes.object,
  maxDomain: PropTypes.number.isRequired,
  minDomain: PropTypes.number.isRequired,
  fridges: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  onSelectFridge: PropTypes.func.isRequired,
  onOpenBreachModal: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  blankText: { textAlign: 'center', fontFamily: APP_FONT_FAMILY, fontSize: 20 },
});

export const VaccinePage = connect(mapStateToProps, mapDispatchToProps)(VaccinePageComponent);
