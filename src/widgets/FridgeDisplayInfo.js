/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

import { UIDatabase } from '../database';
import { formatTemperatureExposure, formatTemperature } from '../utilities/formatters';

import { FlexRow } from './FlexRow';
import { ChevronDownIcon } from './icons';
import { SimpleLabel } from './SimpleLabel';

import { WHITE, SUSSOL_ORANGE } from '../globalStyles';
import { vaccineStrings } from '../localization';

export const FridgeDisplayInfo = ({ fridge, isActive, onPress }) => {
  const { description, currentTemperature, temperatureExposure, numberOfBreaches } = fridge;

  const Container = isActive ? View : TouchableOpacity;

  const onSelectFridge = React.useCallback(() => onPress(fridge), []);

  return (
    <Container onPress={onSelectFridge} style={localStyles.container}>
      <FlexRow flex={1} justifyContent="space-between" alignItems="center">
        <FlexRow flex={1} justifyContent="space-evenly">
          <ChevronDownIcon color={isActive ? WHITE : SUSSOL_ORANGE} style={localStyles.icon} />
          <SimpleLabel
            label={description}
            size="large"
            text={formatTemperature(currentTemperature)}
          />
        </FlexRow>

        <FlexRow flex={4} justifyContent="flex-end">
          {numberOfBreaches ? (
            <SimpleLabel
              label={vaccineStrings.breaches}
              text={numberOfBreaches}
              textAlign="right"
              labelAlign="right"
            />
          ) : null}
          <SimpleLabel
            label={vaccineStrings.temperature_exposure}
            text={formatTemperatureExposure(temperatureExposure)}
            textAlign="right"
            labelAlign="right"
          />
          <SimpleLabel
            label={vaccineStrings.total_stock}
            text={fridge.totalStock(UIDatabase)}
            textAlign="right"
            labelAlign="right"
          />
        </FlexRow>
      </FlexRow>
    </Container>
  );
};

const localStyles = StyleSheet.create({
  container: { height: 25, marginTop: 10, marginHorizontal: 10 },
  icon: { marginRight: 10 },
});

FridgeDisplayInfo.propTypes = {
  fridge: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
};