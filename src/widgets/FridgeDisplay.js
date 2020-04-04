/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

import { VaccineChart } from './VaccineChart';
import { FridgeDisplayInfo } from './FridgeDisplayInfo';
import { WHITE, SUSSOL_ORANGE } from '../globalStyles';
import { FlexView } from './FlexView';

export const FridgeDisplay = ({
  minLine,
  maxLine,
  breaches,
  maxDomain,
  minDomain,
  fridge,
  isActive,
  onSelectFridge,
}) => {
  const containerStyle = React.useMemo(
    () => ({ ...localStyles.container, height: isActive ? 300 : 45 }),
    [isActive]
  );
  const [render, setRender] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setRender(isActive), 1000);
  }, [isActive]);

  const Chart = React.useCallback(
    () =>
      render ? (
        <VaccineChart
          minLine={minLine}
          maxDomain={maxDomain}
          minDomain={minDomain}
          maxLine={maxLine}
          breaches={breaches}
        />
      ) : (
        <FlexView justifyContent="center" flex={1} alignItems="center">
          <ActivityIndicator size="small" color={SUSSOL_ORANGE} />
        </FlexView>
      ),
    [render]
  );

  return (
    <View style={containerStyle}>
      <FridgeDisplayInfo onPress={onSelectFridge} fridge={fridge} isActive={isActive} />

      {isActive ? <Chart /> : null}
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

FridgeDisplay.defaultProps = {
  minLine: [],
  maxLine: [],
  breaches: [],
  maxDomain: Infinity,
  minDomain: -Infinity,
  onSelectFridge: null,
};

FridgeDisplay.propTypes = {
  fridge: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  minLine: PropTypes.array,
  maxLine: PropTypes.array,
  breaches: PropTypes.array,
  maxDomain: PropTypes.number,
  minDomain: PropTypes.number,
  onSelectFridge: PropTypes.func,
};
