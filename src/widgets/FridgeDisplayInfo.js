/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

import { UIDatabase } from '../database';
import { formatTemperatureExposure, formatTemperature } from '../utilities/formatters';

import { FlexRow } from './FlexRow';
import { ChevronDownIcon, ChevronUpIcon } from './icons';
import { Separator } from './Separator';

import { APP_FONT_FAMILY, SUSSOL_ORANGE } from '../globalStyles';
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
      <FlexRow alignItems="center" justifyContent="space-between" style={localStyles.container}>
        {isActive ? (
          <ChevronUpIcon color={SUSSOL_ORANGE} style={localStyles.icon} />
        ) : (
          <ChevronDownIcon color={SUSSOL_ORANGE} style={localStyles.icon} />
        )}

        <FlexRow flex={1} alignItems="center" justifyContent="space-evenly">
          <Text style={localStyles.largeLabel}>{description}</Text>
          <Text style={localStyles.largeText}>{formatTemperature(currentTemperature)}</Text>

          <Text style={localStyles.label}>{vaccineStrings.breaches}</Text>
          <Text style={localStyles.text}>{numberOfBreaches}</Text>

          <Text style={localStyles.label}>{vaccineStrings.temperature_exposure}</Text>
          <Text style={localStyles.text}>{formatTemperatureExposure(temperatureExposure)}</Text>

          <Text style={localStyles.label}>{vaccineStrings.total_stock}</Text>
          <Text style={localStyles.text}>{fridge.totalStock(UIDatabase)}</Text>
        </FlexRow>
      </FlexRow>

      {isActive ? (
        <>
          <Separator marginHorizontal={100} marginTop={10} width={2} marginBottom={0} />
          <FlexRow style={localStyles.datePickerRow}>
            <DateRangeSelector
              initialStartDate={fromDate}
              initialEndDate={toDate}
              onChangeToDate={onChangeToDate}
              onChangeFromDate={onChangeFromDate}
            />
          </FlexRow>
        </>
      ) : null}
    </Container>
  );
};

const localStyles = StyleSheet.create({
  container: { height: 30, marginTop: 10, marginHorizontal: 10 },
  datePickerRow: { marginTop: 10, marginHorizontal: 10 },
  largeLabel: {
    fontFamily: APP_FONT_FAMILY,
    color: SUSSOL_ORANGE,
    fontSize: 20,
    fontWeight: 'bold',
  },
  largeText: { fontFamily: APP_FONT_FAMILY, fontSize: 20 },
  label: { fontFamily: APP_FONT_FAMILY, color: SUSSOL_ORANGE, textAlign: 'left' },
  text: { fontFamily: APP_FONT_FAMILY, textAlign: 'right' },
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
