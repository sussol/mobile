/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View } from 'react-native';

import { VaccineChart } from '../widgets/VaccineChart';

const onPress = data => console.log(`Pressed hazard #${data}`);

const chartA = {
  maxLine: [
    { date: 'Feb 23', temp: 5.9 },
    { date: 'Feb 24', temp: 6 },
    { date: 'Feb 25', temp: 7 },
    { date: 'Feb 26', temp: 8.4 },
    { date: 'Feb 27', temp: 8 },
    { date: 'March 1', temp: 6 },
    { date: 'March 2', temp: 5.7 },
    { date: 'March 3', temp: 3.5 },
    { date: 'March 4', temp: 3.8 },
    { date: 'March 5', temp: 2.2 },
  ],
  minLine: [
    { date: 'Feb 23', temp: 3.8 },
    { date: 'Feb 24', temp: 2.5 },
    { date: 'Feb 25', temp: 5.7 },
    { date: 'Feb 26', temp: 6 },
    { date: 'Feb 27', temp: 5 },
    { date: 'March 1', temp: 3.8 },
    { date: 'March 2', temp: 3.5 },
    { date: 'March 3', temp: 2.8 },
    { date: 'March 4', temp: 2 },
    { date: 'March 5', temp: 1.5 },
  ],
  hazards: [
    { date: 'Feb 24', temp: 2.5, onPress, data: 1 },
    { date: 'Feb 24', temp: 6, onPress, data: 2 },
    { date: 'Feb 25', temp: 7, onPress, data: 3 },
    { date: 'Feb 26', temp: 8.4, onPress, data: 4 },
    { date: 'Feb 27', temp: 8, onPress, data: 5 },
    { date: 'March 1', temp: 6, onPress, data: 6 },
    { date: 'March 3', temp: 2.8, onPress, data: 7 },
    { date: 'March 4', temp: 2, onPress, data: 8 },
  ],
  minTemp: 3,
  maxTemp: 6,
};

const chartB = {
  maxLine: [
    { date: '8:00', temp: 7.5 },
    { date: '11:00', temp: 8.5 },
    { date: '14:00', temp: 10.3 },
    { date: '17:00', temp: 12 },
    { date: '20:00', temp: 11.3 },
    { date: '23:00', temp: 7.6 },
  ],
  hazards: [
    { date: '11:00', temp: 8.5, onPress, data: 9 },
    { date: '14:00', temp: 10.3, onPress, data: 10 },
    { date: '17:00', temp: 12, onPress, data: 11 },
    { date: '20:00', temp: 11.3, onPress, data: 12 },
  ],
  maxTemp: 8,
};

const chartC = {
  minLine: [
    { date: '3:15', temp: 2.5 },
    { date: '3:30', temp: 1.5 },
    { date: '3:45', temp: 1 },
    { date: '4:00', temp: 0.5 },
    { date: '4:15', temp: -0.5 },
    { date: '4:30', temp: 1 },
    { date: '4:45', temp: 2 },
  ],
  hazards: [
    { date: '3:30', temp: 1.5, onPress, data: 13 },
    { date: '3:45', temp: 1, onPress, data: 14 },
    { date: '4:00', temp: 0.5, onPress, data: 15 },
    { date: '4:15', temp: -0.5, onPress, data: 16 },
    { date: '4:30', temp: 1, onPress, data: 17 },
  ],
  minTemp: 2,
};

export function VaccineChartPage() {
  const {
    minLine: minLineA,
    maxLine: maxLineA,
    hazards: hazardsA,
    minTemp: minTempA,
    maxTemp: maxTempA,
  } = chartA;
  const { maxLine: maxLineB, hazards: hazardsB, maxTemp: maxTempB } = chartB;
  const { minLine: minLineC, hazards: hazardsC, minTemp: minTempC } = chartC;

  return (
    <View style={chartContainer}>
      <View style={flexRowTop}>
        <VaccineChart
          minLine={minLineA}
          maxLine={maxLineA}
          hazards={hazardsA}
          minTemp={minTempA}
          maxTemp={maxTempA}
        />
      </View>
      <View style={flexRowBottom}>
        <View style={flexColumnBottomLeft}>
          <VaccineChart maxLine={maxLineB} hazards={hazardsB} maxTemp={maxTempB} />
        </View>
        <View style={flexColumnBottomRight}>
          <VaccineChart minLine={minLineC} hazards={hazardsC} minTemp={minTempC} />
        </View>
      </View>
    </View>
  );
}

const chartContainer = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  borderWidth: 1,
  borderColor: 'black',
};

const flexRowTop = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%',
  height: '50%',
  borderWidth: 1,
  borderColor: 'black',
};

const flexRowBottom = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '50%',
  borderWidth: 1,
  borderColor: 'black',
};

const flexColumnBottomLeft = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '50%',
  height: '100%',
  borderWidth: 1,
  borderColor: 'black',
};

const flexColumnBottomRight = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '50%',
  height: '100%',
  borderWidth: 1,
  borderColor: 'black',
};

export default VaccineChartPage;
