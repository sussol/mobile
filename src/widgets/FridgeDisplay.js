/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { VaccineChart } from './VaccineChart';
import { FridgeDisplayInfo } from './FridgeDisplayInfo';

export const FridgeDisplay = ({
  minLine,
  maxLine,
  breaches,
  maxDomain,
  minDomain,
  fridge,
  isActive,
}) => {
  const containerStyle = React.useMemo(
    () => ({ ...localStyles.container, height: isActive ? 300 : 45 }),
    [isActive]
  );

  return (
    <View style={containerStyle}>
      <FridgeDisplayInfo fridge={fridge} isActive={isActive} />

      {isActive ? (
        <VaccineChart
          minLine={minLine}
          maxDomain={maxDomain}
          minDomain={minDomain}
          maxLine={maxLine}
          breaches={breaches}
        />
      ) : null}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    elevation: 3,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 20,
  },
});

FridgeDisplay.defaultProps = {
  minLine: [],
  maxLine: [],
  breaches: [],
  maxDomain: Infinity,
  minDomain: -Infinity,
};

FridgeDisplay.propTypes = {
  fridge: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  minLine: PropTypes.array,
  maxLine: PropTypes.array,
  breaches: PropTypes.array,
  maxDomain: PropTypes.number,
  minDomain: PropTypes.number,
};
