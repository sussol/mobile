/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';

import { DatePickerButton } from './DatePickerButton';
import { FlexRow } from './FlexRow';
import { FlexColumn } from './FlexColumn';

import { textStyles, SUSSOL_ORANGE } from '../globalStyles';
import { generalStrings } from '../localization/index';

export const DateRangeSelector = ({
  initialStartDate,
  initialEndDate,
  onChangeFromDate,
  onChangeToDate,
  labelTextStyle,
  dateTextStyle,
  maximumDate,
  minimumDate,
}) => {
  const formattedStartDate = moment(initialStartDate).format('D/M/YYYY');
  const formattedEndDate = moment(initialEndDate).format('D/M/YYYY');

  return (
    <FlexRow flex={1} alignItems="center">
      <FlexRow alignItems="center">
        <FlexColumn>
          <Text style={labelTextStyle}>{generalStrings.from}</Text>
          <Text style={dateTextStyle}>{formattedStartDate}</Text>
        </FlexColumn>
        <DatePickerButton
          minimumDate={minimumDate}
          maximumDate={initialEndDate}
          initialValue={moment(initialStartDate).startOf('day').toDate()}
          onDateChanged={onChangeFromDate}
        />
      </FlexRow>

      <FlexRow alignItems="center">
        <Text style={dateTextStyle}> ___ </Text>
        <FlexColumn>
          <Text style={labelTextStyle}>{generalStrings.to}</Text>
          <Text style={dateTextStyle}>{formattedEndDate}</Text>
        </FlexColumn>
        <DatePickerButton
          maximumDate={maximumDate}
          minimumDate={initialStartDate}
          initialValue={moment(initialEndDate).endOf('day').toDate()}
          onDateChanged={onChangeToDate}
        />
      </FlexRow>
    </FlexRow>
  );
};

const localStyles = StyleSheet.create({
  dateText: { ...textStyles, marginHorizontal: 10 },
  labelText: { ...textStyles, marginHorizontal: 10, fontWeight: 'bold', color: SUSSOL_ORANGE },
});

DateRangeSelector.defaultProps = {
  labelTextStyle: localStyles.labelText,
  dateTextStyle: localStyles.dateText,
  maximumDate: null,
  minimumDate: null,
};

DateRangeSelector.propTypes = {
  initialStartDate: PropTypes.instanceOf(Date).isRequired,
  initialEndDate: PropTypes.instanceOf(Date).isRequired,
  onChangeFromDate: PropTypes.func.isRequired,
  onChangeToDate: PropTypes.func.isRequired,
  labelTextStyle: PropTypes.object,
  dateTextStyle: PropTypes.object,
  maximumDate: PropTypes.instanceOf(Date),
  minimumDate: PropTypes.instanceOf(Date),
};
