/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View } from 'react-native';

import { ChartWrapper } from '../widgets/ChartWrapper';
import { VaccineChart } from '../widgets/VaccineChart';

console.disableYellowBox = true;

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
    { date: 'Feb 24', temp: 2.5, onClick: () => console.log('CLICKED HAZARD 1') },
    { date: 'Feb 24', temp: 6, onClick: () => console.log('CLICKED HAZARD 2') },
    { date: 'Feb 25', temp: 7, onClick: () => console.log('CLICKED HAZARD 3') },
    { date: 'Feb 26', temp: 8.4, onClick: () => console.log('CLICKED HAZARD 4') },
    { date: 'Feb 27', temp: 8, onClick: () => console.log('CLICKED HAZARD 5') },
    { date: 'March 1', temp: 6, onClick: () => console.log('CLICKED HAZARD 6') },
    { date: 'March 3', temp: 2.8, onClick: () => console.log('CLICKED HAZARD 7') },
    { date: 'March 4', temp: 2, onClick: () => console.log('CLICKED HAZARD 8') },
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
    { date: '11:00', temp: 8.5 },
    { date: '14:00', temp: 10.3 },
    { date: '17:00', temp: 12 },
    { date: '20:00', temp: 11.3 },
  ],
  maxTemp: 8,
};

// const breachB = {
//   data: [
//     { date: '3:15', temp: 2.5 },
//     { date: '3:30', temp: 1.5 },
//     { date: '3:45', temp: 1 },
//     { date: '4:00', temp: 0.5 },
//     { date: '4:15', temp: -0.5 },
//     { date: '4:30', temp: 1 },
//     { date: '4:45', temp: 2 },
//   ],
//   boundary: 2,
//   color: 'blue',
//   eventHandler: () => console.log('CLICKED'),
// };

// eslint-disable-next-line react/prefer-stateless-function
export class VaccineChartPage extends React.Component {
  // eslint-disable-next-line class-methods-use-this
  render() {
    const {
      minLine: minLineA,
      maxLine: maxLineA,
      hazards: hazardsA,
      minTemp: minTempA,
      maxTemp: maxTempA,
    } = chartA;

    const renderChartA = (width, height) => (
      <VaccineChart
        minLine={minLineA}
        maxLine={maxLineA}
        hazards={hazardsA}
        minTemp={minTempA}
        maxTemp={maxTempA}
        width={width}
        height={height}
      />
    );

    const { maxLine: maxLineB, hazards: hazardsB, maxTemp: maxTempB } = chartB;

    const renderChartB = (width, height) => (
      <VaccineChart
        maxLine={maxLineB}
        hazards={hazardsB}
        maxTemp={maxTempB}
        width={width}
        height={height}
      />
    );

    return (
      <View style={chartContainer}>
        <View style={flexRowTop}>
          <ChartWrapper chartFunction={renderChartA} />
        </View>
        <View style={flexRowBottom}>
          <View style={flexColumnBottomLeft}>
            <ChartWrapper chartFunction={renderChartB} />
          </View>
          <View style={flexColumnBottomRight}>
            <ChartWrapper chartFunction={renderChartB} />
          </View>
        </View>
      </View>
    );
  }
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
