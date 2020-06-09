/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { VaccineChart } from './VaccineChart';
import { FridgeDisplayInfo } from './FridgeDisplayInfo';
import { textStyles, WHITE, SUSSOL_ORANGE } from '../globalStyles';
import { FlexView } from './FlexView';

import { FridgeActions } from '../actions/FridgeActions';
import { selectTemperatureLogsFromDate, selectTemperatureLogsToDate } from '../selectors/fridge';
import { vaccineStrings } from '../localization';

export const FridgeDisplayComponent = ({
  minLine,
  maxLine,
  breaches,
  maxDomain,
  minDomain,
  fridge,
  isActive,
  onSelectFridge,
  onOpenBreachModal,
  onChangeFromDate,
  onChangeToDate,
  fromDate,
  toDate,
}) => {
  const containerStyle = React.useMemo(
    () => ({ ...localStyles.container, height: isActive ? 300 : 45 }),
    [isActive]
  );
  const [render, setRender] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setRender(isActive), 500);
  }, [isActive]);

  const NoLogsComponent = React.useCallback(
    () => (
      <FlexView justifyContent="center" alignItems="center">
        <Text style={{ ...textStyles }}>{vaccineStrings.oops_no_temperatures}</Text>
      </FlexView>
    ),
    []
  );

  const Chart = React.useCallback(
    () =>
      render ? (
        <VaccineChart
          minLine={minLine}
          maxDomain={maxDomain}
          minDomain={minDomain}
          maxLine={maxLine}
          breaches={breaches}
          onPressBreach={onOpenBreachModal}
        />
      ) : (
        <FlexView justifyContent="center" flex={1} alignItems="center">
          <ActivityIndicator size="small" color={SUSSOL_ORANGE} />
        </FlexView>
      ),
    [render, minLine, maxDomain, minDomain, maxLine, breaches, onOpenBreachModal]
  );

  return (
    <View style={containerStyle}>
      <FridgeDisplayInfo
        onPress={onSelectFridge}
        fridge={fridge}
        isActive={isActive}
        fromDate={fromDate}
        toDate={toDate}
        onChangeFromDate={onChangeFromDate}
        onChangeToDate={onChangeToDate}
      />

      {isActive ? (minLine.length && <Chart />) || <NoLogsComponent /> : null}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    elevation: 3,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: WHITE,
  },
});

FridgeDisplayComponent.defaultProps = {
  minLine: [],
  maxLine: [],
  breaches: [],
  maxDomain: Infinity,
  minDomain: -Infinity,
  onSelectFridge: null,
};

FridgeDisplayComponent.propTypes = {
  fridge: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  minLine: PropTypes.array,
  maxLine: PropTypes.array,
  breaches: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  maxDomain: PropTypes.number,
  minDomain: PropTypes.number,
  onSelectFridge: PropTypes.func,
  onOpenBreachModal: PropTypes.func.isRequired,
  onChangeFromDate: PropTypes.func.isRequired,
  onChangeToDate: PropTypes.func.isRequired,
  fromDate: PropTypes.instanceOf(Date).isRequired,
  toDate: PropTypes.instanceOf(Date).isRequired,
};

const mapStateToProps = state => {
  const fromDate = selectTemperatureLogsFromDate(state);
  const toDate = selectTemperatureLogsToDate(state);
  return { fromDate, toDate };
};

const mapDispatchToProps = dispatch => {
  const onChangeToDate = date => dispatch(FridgeActions.changeToDate(date));
  const onChangeFromDate = date => dispatch(FridgeActions.changeFromDate(date));

  return { onChangeFromDate, onChangeToDate };
};

export const FridgeDisplay = connect(mapStateToProps, mapDispatchToProps)(FridgeDisplayComponent);
