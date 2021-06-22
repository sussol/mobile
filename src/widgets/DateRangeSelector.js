/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';

import { DatePickerButton } from './DatePickerButton';
import { FlexRow } from './FlexRow';

import { textStyles, LIGHT_GREY, WHITE } from '../globalStyles';
import { useLayoutDimensions } from '../hooks/useLayoutDimensions';

export const DateRangeSelector = ({
  initialStartDate,
  initialEndDate,
  onChangeFromDate,
  onChangeToDate,
  dateTextStyle,
  maximumDate,
  minimumDate,
  backgroundColor,
  containerStyle,
}) => {
  const formattedStartDate = moment(initialStartDate).format('D/M/YYYY');
  const formattedEndDate = moment(initialEndDate).format('D/M/YYYY');
  const [, height, setDimensions] = useLayoutDimensions();

  return (
    <View
      onLayout={setDimensions}
      style={[localStyles.container, { borderRadius: height, backgroundColor }, containerStyle]}
    >
      <FlexRow alignItems="center">
        <DatePickerButton
          minimumDate={minimumDate}
          maximumDate={initialEndDate}
          initialValue={moment(initialStartDate).startOf('day').toDate()}
          onDateChanged={onChangeFromDate}
          isCircle={false}
          label={formattedStartDate}
          labelStyle={dateTextStyle}
        />
      </FlexRow>

      <FlexRow alignItems="center">
        <Text style={localStyles.dashText}>—</Text>
        <DatePickerButton
          maximumDate={maximumDate}
          minimumDate={initialStartDate}
          initialValue={moment(initialEndDate).endOf('day').toDate()}
          onDateChanged={onChangeToDate}
          isCircle={false}
          label={formattedEndDate}
          labelStyle={dateTextStyle}
        />
      </FlexRow>
    </View>
  );
};

const localStyles = StyleSheet.create({
  dateText: { ...textStyles, paddingLeft: 5 },
  dashText: { ...textStyles, paddingHorizontal: 5 },
  container: {
    flexDirection: 'row',
    backgroundColor: LIGHT_GREY,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});

DateRangeSelector.defaultProps = {
  dateTextStyle: localStyles.dateText,
  maximumDate: null,
  minimumDate: null,
  backgroundColor: WHITE,
  containerStyle: {},
};

DateRangeSelector.propTypes = {
  containerStyle: PropTypes.object,
  initialStartDate: PropTypes.instanceOf(Date).isRequired,
  initialEndDate: PropTypes.instanceOf(Date).isRequired,
  onChangeFromDate: PropTypes.func.isRequired,
  onChangeToDate: PropTypes.func.isRequired,
  dateTextStyle: PropTypes.object,
  maximumDate: PropTypes.instanceOf(Date),
  minimumDate: PropTypes.instanceOf(Date),
  backgroundColor: PropTypes.string,
};
