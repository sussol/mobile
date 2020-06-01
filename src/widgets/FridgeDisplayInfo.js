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
import { ChevronDownIcon, ChevronUpIcon } from './icons';
import { SimpleLabel } from './SimpleLabel';

import { SUSSOL_ORANGE } from '../globalStyles';
import { vaccineStrings } from '../localization';
import { DateRangeSelector } from './DateRangeSelector';

export const FridgeDisplayInfo = ({
  fridge,
  isActive,
  onPress,
  onChangeFromDate,
  onChangeToDate,
  fromDate,
  toDate,
}) => {
  const { description, currentTemperature, temperatureExposure, numberOfBreaches } = fridge;

  const Container = isActive ? View : TouchableOpacity;

  const onSelectFridge = React.useCallback(() => onPress(fridge), []);

  return (
    <Container onPress={onSelectFridge}>
      <FlexRow
        flex={1}
        justifyContent="space-between"
        alignItems="center"
        style={localStyles.container}
      >
        <FlexRow flex={1} justifyContent="space-evenly">
          {isActive ? (
            <ChevronUpIcon color={SUSSOL_ORANGE} style={localStyles.icon} />
          ) : (
            <ChevronDownIcon color={SUSSOL_ORANGE} style={localStyles.icon} />
          )}
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

      {isActive ? (
        <FlexRow style={localStyles.datePickerRow}>
          <DateRangeSelector
            initialStartDate={fromDate}
            initialEndDate={toDate}
            onChangeToDate={onChangeFromDate}
            onChangeFromDate={onChangeToDate}
          />
        </FlexRow>
      ) : null}
    </Container>
  );
};

const localStyles = StyleSheet.create({
  container: { height: 30, marginTop: 20, marginHorizontal: 10 },
  datePickerRow: { marginTop: 50, marginHorizontal: 10, height: 15 },
  icon: { marginRight: 10 },
});

FridgeDisplayInfo.propTypes = {
  fridge: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
  onChangeFromDate: PropTypes.func.isRequired,
  onChangeToDate: PropTypes.func.isRequired,
  fromDate: PropTypes.instanceOf(Date).isRequired,
  toDate: PropTypes.instanceOf(Date).isRequired,
};
